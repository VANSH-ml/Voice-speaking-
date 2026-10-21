/**
 * Manages speech playback for a single audio context.
 * Handles both browser Web Speech API and server-generated audio.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/services/api'
import { useAppStore } from '@/store/useAppStore'
import { base64ToAudioUrl, downloadAudio } from '@/utils'
import type { SpeechResult, SpeechStyle } from '@/types'

export type PlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

interface UseSpeechOptions {
  loadingKey: 'speech_original' | 'speech_translated'
}

export function useSpeech({ loadingKey }: UseSpeechOptions) {
  const { settings, setLoading, setError } = useAppStore()

  const [state, setState] = useState<PlaybackState>('idle')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [speechResult, setSpeechResult] = useState<SpeechResult | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stopAll() {
    // Stop HTML audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    // Stop browser speech
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel()
    }
    if (progressTimerRef.current) clearInterval(progressTimerRef.current)
  }

  const speak = useCallback(
    async (text: string, language: string, style?: SpeechStyle) => {
      stopAll()
      setState('loading')
      setLoading(loadingKey, true)
      setError(loadingKey, null)

      try {
        const result = await api.generateSpeech(text, language, {
          speed: settings.speechSpeed,
          style: style ?? settings.speechStyle,
        })
        setSpeechResult(result)

        if (result.mode === 'browser_speech' && result.browser_speech_config) {
          _playBrowserSpeech(result.browser_speech_config)
        } else if (result.mode === 'audio_data' && result.audio_base64) {
          const url = base64ToAudioUrl(result.audio_base64, result.audio_format ?? 'mp3')
          setAudioUrl(url)
          _playAudioUrl(url)
        } else {
          setState('error')
          setError(loadingKey, 'Speech synthesis is unavailable for this language.')
          toast.error('Speech unavailable for this language')
        }
      } catch (err: unknown) {
        setState('error')
        const msg = err instanceof Error ? err.message : 'Speech generation failed'
        setError(loadingKey, msg)
        toast.error(msg)
      } finally {
        setLoading(loadingKey, false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings.speechSpeed, settings.speechStyle, loadingKey],
  )

  function _playBrowserSpeech(cfg: NonNullable<SpeechResult['browser_speech_config']>) {
    if (!window.speechSynthesis) {
      setState('error')
      setError(loadingKey, 'Your browser does not support speech synthesis.')
      return
    }
    const utterance = new SpeechSynthesisUtterance(cfg.text)
    utterance.lang = cfg.lang
    utterance.rate = cfg.rate
    utterance.pitch = cfg.pitch
    utterance.volume = cfg.volume

    utterance.onstart = () => setState('playing')
    utterance.onpause = () => setState('paused')
    utterance.onresume = () => setState('playing')
    utterance.onend = () => {
      setState('idle')
      setProgress(0)
    }
    utterance.onerror = () => {
      setState('error')
      setError(loadingKey, 'Browser speech synthesis failed.')
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
    setState('playing')
  }

  function _playAudioUrl(url: string) {
    const audio = new Audio(url)
    audioRef.current = audio

    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.ontimeupdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    audio.onplay = () => setState('playing')
    audio.onpause = () => setState('paused')
    audio.onended = () => {
      setState('idle')
      setProgress(0)
    }
    audio.onerror = () => {
      setState('error')
      setError(loadingKey, 'Audio playback failed.')
    }

    audio.play().catch(() => {
      setState('error')
      setError(loadingKey, 'Audio playback was blocked by the browser.')
    })
  }

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause()
    else window.speechSynthesis?.pause()
  }, [])

  const resume = useCallback(() => {
    if (audioRef.current) audioRef.current.play()
    else window.speechSynthesis?.resume()
  }, [])

  const stop = useCallback(() => {
    stopAll()
    setState('idle')
    setProgress(0)
  }, [])

  const download = useCallback(() => {
    if (audioUrl) {
      downloadAudio(audioUrl)
    } else {
      toast('Download is only available when a server TTS provider generates audio.')
    }
  }, [audioUrl])

  const canDownload = speechResult?.mode === 'audio_data' && !!audioUrl

  return {
    state,
    progress,
    duration,
    speak,
    pause,
    resume,
    stop,
    download,
    canDownload,
    speechResult,
  }
}
