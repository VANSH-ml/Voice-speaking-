import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Search, Trash2, X, ThumbsUp, ThumbsDown,
  ArrowRight, RotateCcw, ChevronDown, ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { formatTimestamp, truncate } from '@/utils'
import { Badge } from '@/components/ui/Badge'
import type { HistoryEntry } from '@/types'

interface HistoryCardProps {
  entry: HistoryEntry
  onRemove: (id: string) => void
  onReuse: (entry: HistoryEntry) => void
  onFeedback: (id: string, fb: 'helpful' | 'not_helpful') => void
}

function HistoryCard({ entry, onRemove, onReuse, onFeedback }: HistoryCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      className="rounded-xl border border-white/5 bg-navy-800/50 p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base">{entry.source_flag}</span>
          <Badge variant="violet">{entry.source_language_name}</Badge>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-base">{entry.target_flag}</span>
          <Badge variant="cyan">{entry.target_language_name}</Badge>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs text-slate-600">{formatTimestamp(entry.timestamp)}</span>
          <button
            onClick={() => onRemove(entry.id)}
            className="p-1 rounded hover:bg-red-500/10 hover:text-red-400 text-slate-600 transition-colors ml-1"
            aria-label="Remove entry"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Text preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-600 mb-1">Original</p>
          <p className="text-slate-400 leading-relaxed">
            {expanded ? entry.original_text : truncate(entry.original_text, 120)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Translation</p>
          <p className="text-slate-200 leading-relaxed">
            {expanded ? entry.translated_text : truncate(entry.translated_text, 120)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="btn-ghost text-xs py-1 px-2 gap-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Less' : 'More'}
        </button>

        <button
          onClick={() => onReuse(entry)}
          className="btn-ghost text-xs py-1 px-2 gap-1"
          title="Reload into editor"
        >
          <RotateCcw className="w-3 h-3" />
          Reuse
        </button>

        {/* Feedback */}
        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-slate-600 mr-1">Helpful?</span>
          <button
            onClick={() => onFeedback(entry.id, 'helpful')}
            className={`p-1.5 rounded transition-colors ${
              entry.feedback === 'helpful'
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
            aria-label="Mark as helpful"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onFeedback(entry.id, 'not_helpful')}
            className={`p-1.5 rounded transition-colors ${
              entry.feedback === 'not_helpful'
                ? 'bg-red-500/20 text-red-400'
                : 'text-slate-600 hover:text-red-400 hover:bg-red-500/10'
            }`}
            aria-label="Mark as not helpful"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  )
}

// ── Main History Panel ─────────────────────────────────────────────────────────

export function TranslationHistory() {
  const {
    history,
    removeFromHistory,
    clearHistory,
    setFeedback,
    setInputText,
    setDetectionResult,
    setTargetLanguage,
    setTranslationResult,
  } = useAppStore()

  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return history.filter((h) => {
      const matchSearch =
        !q ||
        h.original_text.toLowerCase().includes(q) ||
        h.translated_text.toLowerCase().includes(q) ||
        h.source_language_name.toLowerCase().includes(q) ||
        h.target_language_name.toLowerCase().includes(q)
      const matchLang =
        !langFilter ||
        h.source_language === langFilter ||
        h.target_language === langFilter
      return matchSearch && matchLang
    })
  }, [history, search, langFilter])

  function handleReuse(entry: HistoryEntry) {
    setInputText(entry.original_text)
    setDetectionResult({
      language_code: entry.source_language,
      language_name: entry.source_language_name,
      confidence: null,
      confidence_label: 'Loaded from history',
      alternatives: [],
      is_reliable: true,
    })
    setTargetLanguage(entry.target_language)
    setTranslationResult({
      original_text: entry.original_text,
      translated_text: entry.translated_text,
      source_language: entry.source_language,
      source_language_name: entry.source_language_name,
      target_language: entry.target_language,
      target_language_name: entry.target_language_name,
      provider: 'history',
      characters_translated: entry.original_text.length,
    })
    toast.success('Loaded from history')
  }

  function handleClear() {
    if (window.confirm('Clear all translation history? This cannot be undone.')) {
      clearHistory()
      toast.success('History cleared')
    }
  }

  // Unique lang codes for filter chips
  const langCodes = useMemo(() => {
    const set = new Set<string>()
    history.forEach((h) => { set.add(h.source_language); set.add(h.target_language) })
    return Array.from(set).slice(0, 12)
  }, [history])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Clock className="w-5 h-5 text-violet-400" />
          Translation History
          <span className="text-sm font-normal text-slate-500">({history.length})</span>
        </h2>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="btn-ghost text-xs gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </button>
        )}
      </div>

      {/* Local-storage note */}
      <p className="text-xs text-slate-600 flex items-center gap-1.5">
        🔒 History is stored locally in your browser only — nothing is sent to any server.
      </p>

      {/* Search */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search history…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-9 text-sm py-2.5"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Language filter chips */}
          {langCodes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setLangFilter('')}
                className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                  !langFilter
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                    : 'border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                }`}
              >
                All
              </button>
              {langCodes.map((code) => (
                <button
                  key={code}
                  onClick={() => setLangFilter(langFilter === code ? '' : code)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors font-mono ${
                    langFilter === code
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                      : 'border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-700 mx-auto" />
          <p className="text-slate-400 font-medium">No translation history yet</p>
          <p className="text-sm text-slate-600">
            Translations you make will appear here automatically.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-slate-400">No matches for "{search}"</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((entry) => (
              <HistoryCard
                key={entry.id}
                entry={entry}
                onRemove={removeFromHistory}
                onReuse={handleReuse}
                onFeedback={setFeedback}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
