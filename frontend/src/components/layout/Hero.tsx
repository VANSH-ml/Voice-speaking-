import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Globe2, Mic2, Languages, Zap } from 'lucide-react'

const FEATURES = [
  { icon: Globe2,     label: 'Auto Language Detection', color: 'text-violet-400' },
  { icon: Languages,  label: 'Neural Translation',       color: 'text-cyan-400' },
  { icon: Mic2,       label: 'Natural Text-to-Speech',   color: 'text-electric-400' },
  { icon: Zap,        label: '49+ Languages',            color: 'text-amber-400' },
]

const FLOATING_LANGS = [
  { label: 'English',  flag: '🇺🇸', x: '8%',  y: '20%' },
  { label: 'Hindi',    flag: '🇮🇳', x: '80%', y: '15%' },
  { label: 'Japanese', flag: '🇯🇵', x: '72%', y: '65%' },
  { label: 'Arabic',   flag: '🇸🇦', x: '5%',  y: '70%' },
  { label: 'Spanish',  flag: '🇪🇸', x: '45%', y: '80%' },
]

export function Hero() {
  const navigate = useNavigate()

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
      aria-label="Hero section"
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-cyan-500/6 blur-3xl pointer-events-none" />

      {/* Floating language pills */}
      {FLOATING_LANGS.map((lang, i) => (
        <motion.div
          key={lang.label}
          className="absolute hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full
                     bg-navy-800/70 border border-violet-500/15 backdrop-blur-sm text-sm
                     text-slate-300 select-none pointer-events-none"
          style={{ left: lang.x, top: lang.y }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
        >
          <span>{lang.flag}</span>
          <span className="font-medium">{lang.label}</span>
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                     bg-violet-500/10 border border-violet-500/20 text-violet-300
                     text-sm font-medium mb-6"
        >
          <Zap className="w-3.5 h-3.5" />
          AI-Powered Language Studio
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6"
        >
          Every Language.{' '}
          <br className="hidden sm:block" />
          <span className="text-gradient">Every Story.</span>
          <br />
          One Voice.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Paste any text in any language. PolyVoice AI automatically detects the language,
          translates it with neural precision, and reads it aloud — in both the original
          and translated voice.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/translate')}
            className="btn-primary text-base px-8 py-3.5 shadow-glow"
          >
            Start Translating
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <button
            onClick={() => navigate('/history')}
            className="btn-secondary text-base px-8 py-3.5"
          >
            <Globe2 className="w-5 h-5" />
            View History
          </button>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {FEATURES.map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="flex items-center gap-2 px-4 py-2 rounded-full
                         bg-navy-800/50 border border-white/5 text-sm text-slate-300"
            >
              <Icon className={`w-4 h-4 ${color}`} />
              {label}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-navy-950 to-transparent pointer-events-none" />
    </section>
  )
}
