import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/services/api'
import { useAppStore } from '@/store/useAppStore'

export function useDetection() {
  const {
    inputText,
    setDetectionResult,
    setTextAnalysis,
    setLoading,
    setError,
    loading,
  } = useAppStore()

  const analyze = useCallback(async () => {
    if (!inputText.trim()) {
      toast.error('Enter some text to analyze')
      return
    }

    setLoading('detect', true)
    setError('detect', null)

    try {
      const [detection, analysis] = await Promise.all([
        api.detectLanguage(inputText),
        api.analyzeText(inputText),
      ])
      setDetectionResult(detection)
      setTextAnalysis(analysis)
      toast.success(`Detected: ${detection.language_name}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Detection failed'
      setError('detect', msg)
      toast.error(msg)
    } finally {
      setLoading('detect', false)
    }
  }, [inputText, setDetectionResult, setTextAnalysis, setLoading, setError])

  return { analyze, isAnalyzing: loading.detect }
}
