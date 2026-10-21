/**
 * Typed API client — all requests go through the Vite proxy to /api
 * so no API keys are ever in the browser.
 */

import axios, { AxiosError } from 'axios'
import type {
  DetectionResult,
  HealthResponse,
  LanguagesResponse,
  SpeechResult,
  SpeechStyle,
  SummaryResult,
  TextAnalysis,
  TranslationResult,
} from '@/types'

const client = axios.create({
  baseURL: '/api',
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Error normaliser ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function handleError(err: unknown): never {
  if (err instanceof AxiosError) {
    const msg =
      err.response?.data?.detail ||
      err.response?.data?.error ||
      err.message ||
      'Unknown API error'
    throw new ApiError(msg, err.response?.status ?? 0)
  }
  throw err
}

// ── Endpoints ─────────────────────────────────────────────────────────────────

export const api = {
  async health(): Promise<HealthResponse> {
    try {
      const { data } = await client.get<HealthResponse>('/health')
      return data
    } catch (e) {
      return handleError(e)
    }
  },

  async getLanguages(): Promise<LanguagesResponse> {
    try {
      const { data } = await client.get<LanguagesResponse>('/languages')
      return data
    } catch (e) {
      return handleError(e)
    }
  },

  async detectLanguage(text: string): Promise<DetectionResult> {
    try {
      const { data } = await client.post<DetectionResult>('/detect-language', { text })
      return data
    } catch (e) {
      return handleError(e)
    }
  },

  async translate(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<TranslationResult> {
    try {
      const { data } = await client.post<TranslationResult>('/translate', {
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      })
      return data
    } catch (e) {
      return handleError(e)
    }
  },

  async generateSpeech(
    text: string,
    language: string,
    options?: { voiceId?: string; speed?: number; style?: SpeechStyle },
  ): Promise<SpeechResult> {
    try {
      const { data } = await client.post<SpeechResult>('/speech', {
        text,
        language,
        voice_id: options?.voiceId ?? null,
        speed: options?.speed ?? 1.0,
        style: options?.style ?? 'natural',
      })
      return data
    } catch (e) {
      return handleError(e)
    }
  },

  async analyzeText(text: string): Promise<TextAnalysis> {
    try {
      const { data } = await client.post<TextAnalysis>('/analyze-text', { text })
      return data
    } catch (e) {
      return handleError(e)
    }
  },

  async summarize(
    text: string,
    language: string = 'en',
    maxSentences: number = 3,
  ): Promise<SummaryResult> {
    try {
      const { data } = await client.post<SummaryResult>('/summarize', {
        text,
        language,
        max_sentences: maxSentences,
      })
      return data
    } catch (e) {
      return handleError(e)
    }
  },
}
