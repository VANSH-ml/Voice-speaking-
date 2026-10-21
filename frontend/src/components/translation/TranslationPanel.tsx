import { motion } from 'framer-motion'
import { Languages, AlertCircle, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useTranslation } from '@/hooks/useTranslation'
import { SpeechPlayer } from '@/components/speech/SpeechPlayer'
import { SkeletonBlock } from '@/components/ui/SkeletonBlock'
import { Badge } from '@/components/ui/Badge'

export function TranslationPanel() {
  const { translationResult, loading, errors } = useAppStore()
  const { translate } = useTranslation()

  if (loading.translate) {
    return (
      <div className="glass-card p-5 space-y-4">
        <SkeletonBlock lines={1} className="w-40" />
        <SkeletonBlock lines={5} />
        <SkeletonBlock lines={1} className="w-32" />
      </div>
    )
  }

  if (errors.translate) {
    return (
      <div className="glass-card p-5 border border-red-500/20 bg-red-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-400 mb-1">Translation Failed</p>
            <p className="text-sm text-slate-400">{errors.translate}</p>
          </div>
          <button onClick={translate} className="btn-ghost text-xs gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    )
  }

  if (!translationResult) return null

  const {
    original_text,
    translated_text,
    source_language,
    source_language_name,
    target_language,
    target_language_name,
    provider,
    characters_translated,
  } = translationResult

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 sm:p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
          <Languages className="w-4 h-4 text-cyan-400" />
          Translation Result
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="violet">{source_language_name} → {target_language_name}</Badge>
          <Badge variant="slate">via {provider}</Badge>
          <Badge variant="cyan">{characters_translated.toLocaleString()} chars</Badge>
        </div>
      </div>

      {/* Original */}
      <div className="rounded-xl border border-violet-500/10 bg-navy-900/40 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Original — {source_language_name}
          </span>
          <span className="text-xs font-mono text-slate-600">({source_language})</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{original_text}</p>
        <div className="mt-3">
          <SpeechPlayer
            text={original_text}
            language={source_language}
            label="Listen to Original"
            loadingKey="speech_original"
          />
        </div>
      </div>

      {/* Arrow divider */}
      <div className="flex items-center justify-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        <span className="mx-3 text-violet-500/60 text-lg">↓</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      </div>

      {/* Translated */}
      <div className="rounded-xl border border-cyan-500/15 bg-navy-900/40 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-cyan-400/80 uppercase tracking-wider">
            Translated — {target_language_name}
          </span>
          <span className="text-xs font-mono text-slate-600">({target_language})</span>
        </div>
        <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap">{translated_text}</p>
        <div className="mt-3">
          <SpeechPlayer
            text={translated_text}
            language={target_language}
            label="Listen to Translation"
            loadingKey="speech_translated"
          />
        </div>
      </div>
    </motion.div>
  )
}
