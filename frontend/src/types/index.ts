// ── Language ──────────────────────────────────────────────────────────────────

export interface LanguageInfo {
  code: string
  name: string
  native_name: string
  flag: string
  supports_tts: boolean
  supports_translation: boolean
}

export interface LanguagesResponse {
  languages: LanguageInfo[]
  total: number
  tts_provider: string
  translation_provider: string
}

// ── Detection ─────────────────────────────────────────────────────────────────

export interface DetectionResult {
  language_code: string
  language_name: string
  confidence: number | null
  confidence_label: string
  alternatives: Array<{
    language_code: string
    language_name: string
    confidence: number
  }>
  is_reliable: boolean
}

// ── Translation ───────────────────────────────────────────────────────────────

export interface TranslationResult {
  original_text: string
  translated_text: string
  source_language: string
  source_language_name: string
  target_language: string
  target_language_name: string
  provider: string
  characters_translated: number
}

// ── Speech ────────────────────────────────────────────────────────────────────

export type SpeechMode = 'audio_data' | 'browser_speech' | 'unavailable'
export type SpeechStyle = 'natural' | 'slow_clear' | 'storytelling'

export interface SpeechResult {
  mode: SpeechMode
  audio_base64: string | null
  audio_format: string | null
  browser_speech_config: {
    text: string
    lang: string
    rate: number
    pitch: number
    volume: number
  } | null
  voice_used: string | null
  language: string
  provider: string
}

// ── Analysis ──────────────────────────────────────────────────────────────────

export interface TextAnalysis {
  word_count: number
  character_count: number
  character_count_no_spaces: number
  sentence_count: number
  paragraph_count: number
  reading_time_seconds: number
  reading_time_label: string
}

// ── Summary ───────────────────────────────────────────────────────────────────

export interface SummaryResult {
  summary: string
  original_word_count: number
  summary_word_count: number
  provider: string
  language: string
}

// ── History ───────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string
  original_text: string
  translated_text: string
  source_language: string
  source_language_name: string
  target_language: string
  target_language_name: string
  source_flag: string
  target_flag: string
  timestamp: number
  feedback?: 'helpful' | 'not_helpful' | null
}

// ── App state ─────────────────────────────────────────────────────────────────

export type LoadingKey =
  | 'detect'
  | 'translate'
  | 'speech_original'
  | 'speech_translated'
  | 'summarize'

export interface AppError {
  key: LoadingKey | 'general'
  message: string
}

// ── Settings ──────────────────────────────────────────────────────────────────

export interface UserSettings {
  theme: 'dark' | 'light'
  defaultTargetLanguage: string
  speechSpeed: number
  speechStyle: SpeechStyle
  autoDetect: boolean
  favoriteLanguages: string[]
  showInsights: boolean
  showHistory: boolean
}

// ── Health ────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string
  version: string
  providers: Record<string, string>
}
