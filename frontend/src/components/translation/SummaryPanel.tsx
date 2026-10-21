import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/services/api'
import { useAppStore } from '@/store/useAppStore'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'

export function SummaryPanel() {
  const { inputText, detectionResult, summaryResult, setSummaryResult, setLoading, loading } = useAppStore()
  const [open, setOpen] = useState(false)

  async function handleSummarize() {
    if (!inputText.trim()) { toast.error('Enter text first'); return }
    setLoading('summarize', true)
    try {
      const result = await api.summarize(inputText, detectionResult?.language_code ?? 'en', 3)
      setSummaryResult(result)
      setOpen(true)
      toast.success('Summary generated')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Summarization failed')
    } finally {
      setLoading('summarize', false)
    }
  }

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Text Summary
          <Badge variant="amber" className="text-xs">Optional</Badge>
        </h2>

        <div className="flex items-center gap-2">
          {summaryResult && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="btn-ghost text-xs gap-1"
            >
              {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {open ? 'Hide' : 'Show'}
            </button>
          )}
          <button
            onClick={handleSummarize}
            disabled={loading.summarize || !inputText.trim()}
            className="btn-secondary text-xs py-1.5 px-4 gap-1"
          >
            {loading.summarize ? <Spinner size="sm" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {summaryResult ? 'Re-summarize' : 'Summarize'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && summaryResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 space-y-3">
              <p className="text-sm text-slate-200 leading-relaxed">{summaryResult.summary}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>{summaryResult.original_word_count} → {summaryResult.summary_word_count} words</span>
                <span>·</span>
                <span>via {summaryResult.provider}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!summaryResult && (
        <p className="text-xs text-slate-500">
          Generate a concise summary of long paragraphs or stories.
          Uses extractive summarization by default; configure OpenAI for AI summaries.
        </p>
      )}
    </div>
  )
}
