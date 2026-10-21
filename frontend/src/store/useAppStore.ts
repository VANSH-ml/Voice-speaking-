/**
 * Global Zustand store — single source of truth for all application state.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  AppError,
  DetectionResult,
  HistoryEntry,
  LanguageInfo,
  LoadingKey,
  SpeechStyle,
  SummaryResult,
  TextAnalysis,
  TranslationResult,
  UserSettings,
} from '@/types'
import { uid } from '@/utils'

// ── State shape ───────────────────────────────────────────────────────────────

interface AppState {
  // Text input
  inputText: string
  setInputText: (text: string) => void

  // Languages
  languages: LanguageInfo[]
  setLanguages: (langs: LanguageInfo[]) => void
  targetLanguage: string
  setTargetLanguage: (code: string) => void

  // Detection
  detectionResult: DetectionResult | null
  setDetectionResult: (r: DetectionResult | null) => void

  // Translation
  translationResult: TranslationResult | null
  setTranslationResult: (r: TranslationResult | null) => void

  // Analysis
  textAnalysis: TextAnalysis | null
  setTextAnalysis: (a: TextAnalysis | null) => void

  // Summary
  summaryResult: SummaryResult | null
  setSummaryResult: (s: SummaryResult | null) => void

  // Loading states
  loading: Record<LoadingKey, boolean>
  setLoading: (key: LoadingKey, value: boolean) => void

  // Errors
  errors: Partial<Record<LoadingKey | 'general', string>>
  setError: (key: LoadingKey | 'general', msg: string | null) => void
  clearErrors: () => void

  // Translation history (persisted)
  history: HistoryEntry[]
  addToHistory: (entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => void
  removeFromHistory: (id: string) => void
  clearHistory: () => void
  setFeedback: (id: string, feedback: 'helpful' | 'not_helpful') => void

  // Settings (persisted)
  settings: UserSettings
  updateSettings: (patch: Partial<UserSettings>) => void
  toggleFavoriteLanguage: (code: string) => void

  // UI state
  activeTab: string
  setActiveTab: (tab: string) => void
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  defaultTargetLanguage: 'fr',
  speechSpeed: 1.0,
  speechStyle: 'natural' as SpeechStyle,
  autoDetect: true,
  favoriteLanguages: ['hi', 'es', 'fr', 'de', 'ja'],
  showInsights: true,
  showHistory: true,
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Text
      inputText: '',
      setInputText: (text) => set({ inputText: text }),

      // Languages
      languages: [],
      setLanguages: (languages) => set({ languages }),
      targetLanguage: DEFAULT_SETTINGS.defaultTargetLanguage,
      setTargetLanguage: (targetLanguage) => set({ targetLanguage }),

      // Detection
      detectionResult: null,
      setDetectionResult: (detectionResult) => set({ detectionResult }),

      // Translation
      translationResult: null,
      setTranslationResult: (translationResult) => set({ translationResult }),

      // Analysis
      textAnalysis: null,
      setTextAnalysis: (textAnalysis) => set({ textAnalysis }),

      // Summary
      summaryResult: null,
      setSummaryResult: (summaryResult) => set({ summaryResult }),

      // Loading
      loading: {
        detect: false,
        translate: false,
        speech_original: false,
        speech_translated: false,
        summarize: false,
      },
      setLoading: (key, value) =>
        set((s) => ({ loading: { ...s.loading, [key]: value } })),

      // Errors
      errors: {},
      setError: (key, msg) =>
        set((s) => ({
          errors: msg
            ? { ...s.errors, [key]: msg }
            : Object.fromEntries(Object.entries(s.errors).filter(([k]) => k !== key)),
        })),
      clearErrors: () => set({ errors: {} }),

      // History
      history: [],
      addToHistory: (entry) =>
        set((s) => ({
          history: [
            { ...entry, id: uid(), timestamp: Date.now() },
            ...s.history.slice(0, 49), // keep last 50
          ],
        })),
      removeFromHistory: (id) =>
        set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),
      setFeedback: (id, feedback) =>
        set((s) => ({
          history: s.history.map((h) => (h.id === id ? { ...h, feedback } : h)),
        })),

      // Settings
      settings: DEFAULT_SETTINGS,
      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      toggleFavoriteLanguage: (code) =>
        set((s) => {
          const favs = s.settings.favoriteLanguages
          const next = favs.includes(code)
            ? favs.filter((c) => c !== code)
            : [...favs, code]
          return { settings: { ...s.settings, favoriteLanguages: next } }
        }),

      // UI
      activeTab: 'translate',
      setActiveTab: (activeTab) => set({ activeTab }),
    }),
    {
      name: 'polyvoice-storage',
      partialize: (state) => ({
        history: state.history,
        settings: state.settings,
        targetLanguage: state.targetLanguage,
      }),
    },
  ),
)
