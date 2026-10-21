import { motion } from 'framer-motion'
import { BookOpen, Hash, AlignLeft, Clock, Globe2, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { SkeletonBlock } from '@/components/ui/SkeletonBlock'

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  delay?: number
}

function StatCard({ icon: Icon, label, value, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col gap-1 p-4 rounded-xl border border-white/5 bg-navy-800/50"
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-current/10`}>
        <Icon className="w-4 h-4 text-current" style={{ color: 'inherit' }} />
      </div>
      <p className="text-2xl font-bold text-slate-100 mt-1">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </motion.div>
  )
}

export function TextInsights() {
  const { textAnalysis, detectionResult, translationResult, loading } = useAppStore()

  if (loading.detect) {
    return (
      <div className="glass-card p-5 space-y-3">
        <SkeletonBlock lines={1} className="w-28" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <SkeletonBlock key={i} lines={3} />)}
        </div>
      </div>
    )
  }

  if (!textAnalysis) return null

  const {
    word_count,
    character_count,
    sentence_count,
    paragraph_count,
    reading_time_label,
  } = textAnalysis

  return (
    <div className="glass-card p-5 sm:p-6 space-y-4">
      <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-violet-400" />
        Text Insights
      </h2>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Hash}       label="Words"       value={word_count.toLocaleString()}      color="text-violet-400" delay={0}    />
        <StatCard icon={AlignLeft}  label="Characters"  value={character_count.toLocaleString()} color="text-cyan-400"   delay={0.05} />
        <StatCard icon={AlignLeft}  label="Sentences"   value={sentence_count}                   color="text-electric-400" delay={0.1} />
        <StatCard icon={AlignLeft}  label="Paragraphs"  value={paragraph_count}                  color="text-amber-400"  delay={0.15} />
        <StatCard icon={Clock}      label="Read Time"   value={reading_time_label}               color="text-emerald-400" delay={0.2} />

        {/* Translation direction */}
        {translationResult ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex flex-col gap-1 p-4 rounded-xl border border-white/5 bg-navy-800/50"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-pink-400">
              <Globe2 className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold text-slate-100 mt-1 flex items-center gap-1">
              {translationResult.source_language.toUpperCase()}
              <ArrowRight className="w-3 h-3 text-slate-500" />
              {translationResult.target_language.toUpperCase()}
            </p>
            <p className="text-xs text-slate-500">Direction</p>
          </motion.div>
        ) : detectionResult ? (
          <StatCard icon={Globe2} label="Language" value={detectionResult.language_code.toUpperCase()} color="text-pink-400" delay={0.25} />
        ) : null}
      </div>
    </div>
  )
}
