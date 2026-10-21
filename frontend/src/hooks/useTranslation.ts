import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/services/api'
import { useAppStore } from '@/store/useAppStore'
import { useLanguages } from './useLanguages'

export function useTranslation() {
  const {
    inputText,
    detectionResult,
    targetLanguage,
    setTranslationResult,
    setLoading,
    setError,
    addToHistory,
    languages,
  } = useAppStore()

  const allLangs = useLanguages()

  const getFlagFor = (code: string) =>
    (allLangs.find((l) => l.code === code) ?? languages.find((l) => l.code === code))?.flag ?? ''

  const translate = useCallback(async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text first')
      return
    }

    const sourceCode = detectionResult?.language_code ?? 'auto'

    setLoading('translate', true)
    setError('translate', null)

    try {
      const result = await api.translate(inputText, sourceCode, targetLanguage)
      setTranslationResult(result)

      // Save to history
      addToHistory({
        original_text: result.original_text,
        translated_text: result.translated_text,
        source_language: result.source_language,
        source_language_name: result.source_language_name,
        target_language: result.target_language,
        target_language_name: result.target_language_name,
        source_flag: getFlagFor(result.source_language),
        target_flag: getFlagFor(result.target_language),
      })

      toast.success(`Translated to ${result.target_language_name}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Translation failed'
      setError('translate', msg)
      toast.error(msg)
    } finally {
      setLoading('translate', false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, detectionResult, targetLanguage])

  return { translate }
}
