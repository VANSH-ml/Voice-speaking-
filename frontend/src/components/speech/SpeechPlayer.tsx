import { useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Play, Pause, Square, RotateCcw, Download, Volume2, VolumeX, Mic2,
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useSpeech, type PlaybackState } from '@/hooks/useSpeech'
import { Spinner } from '@/components/ui/Spinner'
import { Tooltip } from '@/components/ui/Tooltip'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils'

interface SpeechPlayerProps {
  /** The text to speak */
  text: string
  /** BCP-47 or base language code */
  language: string
  /** Label shown on the button */
  label?: string
  /** Which loading key to use in the global store */
  loadingKey: 'speech_original' | 'speech_translated'
  className?: string
}

function stateIcon(state: PlaybackState) {
  switch (state) {
    case 'loading': return <Spinner size="sm" />
    case 'playing': return <Pause className="w-4 h-4" />
    case 'paused':  return <Play className="w-4 h-4" />
    default:        return <Play className="w-4 h-4" />
  }
}

function stateLabel(state: PlaybackState, label: string) {
  switch (state) {
    case 'loading': return 'Generating…'
    case 'playing': return 'Pause'
    case 'paused':  return 'Resume'
    default:        return label
  }
}

export function SpeechPlayer({
  text,
  language,
  label = 'Listen',
  loadingKey,
  className,
}: SpeechPlayerProps) {
  const { settings, updateSettings } = useAppStore()
  const { state, progress, speak, pause, resume, stop, download, canDownload, speechResult } =
    useSpeech({ loadingKey })

  const handlePlayPause = useCallback(() => {
    if (state === 'idle' || state === 'error') {
      speak(text, language)
    } else if (state === 'playing') {
      pause()
    } else if (state === 'paused') {
      resume()
    }
  }, [state, speak, text, language, pause, resume])

  const isActive = state === 'playing' || state === 'paused'

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main controls row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Play / Pause / Resume */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handlePlayPause}
          disabled={!text || state === 'loading'}
          className={cn(
            'btn-primary text-sm py-2.5 px-5',
            state === 'error' && 'from-red-600 to-red-500 hover:from-red-500 hover:to-red-400',
          )}
          aria-label={stateLabel(state, label)}
        >
          {stateIcon(state)}
          {stateLabel(state, label)}
        </motion.button>

        {/* Stop */}
        {isActive && (
          <Tooltip content="Stop">
            <button onClick={stop} className="btn-ghost p-2.5" aria-label="Stop">
              <Square className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

        {/* Replay */}
        {(state === 'idle' && speechResult) && (
          <Tooltip content="Replay">
            <button onClick={() => speak(text, language)} className="btn-ghost p-2.5" aria-label="Replay">
              <RotateCcw className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

        {/* Download */}
        {canDownload && (
          <Tooltip content="Download MP3">
            <button onClick={download} className="btn-ghost p-2.5" aria-label="Download audio">
              <Download className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

        {/* Provider badge */}
        {speechResult && (
          <Badge variant={speechResult.provider === 'browser' ? 'slate' : 'cyan'} className="ml-auto">
            <Mic2 className="w-3 h-3" />
            {speechResult.provider === 'browser' ? 'Browser TTS' : speechResult.provider}
          </Badge>
        )}
      </div>

      {/* Progress bar (for audio_data mode) */}
      {isActive && speechResult?.mode === 'audio_data' && (
        <div className="h-1.5 rounded-full bg-navy-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      )}

      {/* Browser speech note */}
      {speechResult?.mode === 'browser_speech' && (
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <VolumeX className="w-3 h-3" />
          Using browser speech synthesis — audio quality and voice availability depend on your
          browser and OS. Download is not available for browser TTS.
        </p>
      )}

      {/* Error state */}
      {state === 'error' && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <Volume2 className="w-3 h-3" />
          Speech unavailable for this language/provider combination.
        </p>
      )}

      {/* Speed selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">Speed</span>
        <div className="flex gap-1">
          {[0.75, 1.0, 1.25, 1.5, 2.0].map((speed) => (
            <button
              key={speed}
              onClick={() => updateSettings({ speechSpeed: speed })}
              className={cn(
                'px-2 py-0.5 rounded text-xs font-mono transition-colors',
                settings.speechSpeed === speed
                  ? 'bg-violet-500/25 text-violet-300'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5',
              )}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
