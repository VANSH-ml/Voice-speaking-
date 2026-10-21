import { motion } from 'framer-motion'
import { TextEditor } from '@/components/editor/TextEditor'
import { LanguageDetector } from '@/components/translation/LanguageDetector'
import { LanguageSelector } from '@/components/translation/LanguageSelector'
import { TranslationPanel } from '@/components/translation/TranslationPanel'
import { ComparisonView } from '@/components/translation/ComparisonView'
import { TextInsights } from '@/components/translation/TextInsights'
import { SummaryPanel } from '@/components/translation/SummaryPanel'
import { FavoriteLanguages } from '@/components/history/FavoriteLanguages'
import { TranslationHistory } from '@/components/history/TranslationHistory'
import { useAppStore } from '@/store/useAppStore'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }),
}

export function TranslatePage() {
  const { translationResult, settings } = useAppStore()

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Page heading */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold text-slate-100">Translate Studio</h1>
        <p className="text-slate-500">
          Paste text, detect the language, translate it, and listen to both versions.
        </p>
      </motion.div>

      {/* Favourite quick-pick */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
        <FavoriteLanguages />
      </motion.div>

      {/* Text editor */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
        <TextEditor />
      </motion.div>

      {/* Detection + selector side-by-side on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={2}>
          <LanguageDetector />
        </motion.div>
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}>
          <LanguageSelector />
        </motion.div>
      </div>

      {/* Insights */}
      {settings.showInsights && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
          <TextInsights />
        </motion.div>
      )}

      {/* Summary (optional) */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={5}>
        <SummaryPanel />
      </motion.div>

      {/* Translation result */}
      {translationResult && (
        <>
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={6}>
            <TranslationPanel />
          </motion.div>
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={7}>
            <ComparisonView />
          </motion.div>
        </>
      )}

      {/* Inline history (can be hidden in Settings) */}
      {settings.showHistory && (
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={8}>
          <div className="glass-card p-5 sm:p-6">
            <TranslationHistory />
          </div>
        </motion.div>
      )}
    </div>
  )
}
