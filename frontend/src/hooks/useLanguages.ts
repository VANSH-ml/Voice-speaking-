import { useEffect } from 'react'
import { api } from '@/services/api'
import { useAppStore } from '@/store/useAppStore'

export function useLanguages() {
  const { languages, setLanguages } = useAppStore()

  useEffect(() => {
    if (languages.length > 0) return
    api.getLanguages().then((r) => setLanguages(r.languages)).catch(console.error)
  }, [languages.length, setLanguages])

  return languages
}
