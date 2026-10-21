import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/Badge'
import { SkeletonBlock } from '@/components/ui/SkeletonBlock'
import { cn } from '@/utils'

export function LanguageDetector() {
  const { detectionResult, loading } = useAppStore()
  const [showAlts, setShowAlts] = useState(false)

  if (loading.detect) {
    return (
      <div className="glass-card p-5 space-y-3">
        <SkeletonBlock lines={1} className="w-32" />
        <SkeletonBlock lines={2} />
      </div>
    )
  }

  if (!detectionResult) return null

  const { language_name, language_code, confidence, confidence_label, alternatives, is_reliable } = detectionResult
  const pct = confidence != null ? Math.round(confidence * 100) : null

  const barColor =
    pct == null ? 'from-slate-600 to-slate-500'
    : pct >= 80  ? 'from-violet-500 to-cyan-400'
    : pct >= 60  ? 'from-amber-500 to-yellow-400'
    : 'from-red-500 to-orange-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Detected Language
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-2xl font-bold text-slate-100">{language_name}</h3>
            <Badge variant="violet">{language_code.toUpperCase()}</Badge>
            {is_reliable ? (
              <Badge variant="green">
                <ShieldCheck className="w-3 h-3" />
                Reliable
              </Badge>
            ) : (
              <Badge variant="amber">
                <AlertTriangle className="w-3 h-3" />
                Low confidence
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Confidence
          </span>
          <span className={cn(pct != null ? 'text-slate-200 font-medium' : 'text-slate-500')}>
            {pct != null ? `${pct}%` : '—'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-navy-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: pct != null ? `${pct}%` : '0%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn('h-full rounded-full bg-gradient-to-r', barColor)}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">{confidence_label}</p>
      </div>

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div>
          <button
            onClick={() => setShowAlts((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors"
          >
            {showAlts ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {alternatives.length} alternative{alternatives.length > 1 ? 's' : ''}
          </button>
          <AnimatePresence>
            {showAlts && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {alternatives.map((alt) => (
                  <li key={alt.language_code} className="flex items-center justify-between text-xs text-slate-400">
                    <span>{alt.language_name} <span className="text-slate-600">({alt.language_code})</span></span>
                    <span className="font-mono text-slate-500">{Math.round(alt.confidence * 100)}%</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
