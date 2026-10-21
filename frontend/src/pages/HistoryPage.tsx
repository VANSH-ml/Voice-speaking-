import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { TranslationHistory } from '@/components/history/TranslationHistory'

export function HistoryPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3 mb-1">
          <Clock className="w-7 h-7 text-violet-400" />
          Translation History
        </h1>
        <p className="text-slate-500">
          All your recent translations — stored privately in your browser.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="glass-card p-5 sm:p-6"
      >
        <TranslationHistory />
      </motion.div>
    </div>
  )
}
