import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Globe2, Languages, Mic2, Clock, ArrowRight, Zap,
  ShieldCheck, Layers, ChevronRight,
} from 'lucide-react'
import { Hero } from '@/components/layout/Hero'

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Globe2,
    title: 'Paste Your Text',
    desc: 'Enter any paragraph, story, or conversation in any of the 49 supported languages, or upload a .txt file.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    step: '02',
    icon: Zap,
    title: 'Detect Language',
    desc: 'PolyVoice automatically identifies the language with a confidence score powered by Lingua.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  {
    step: '03',
    icon: Languages,
    title: 'Translate Instantly',
    desc: 'Select any target language and get a neural translation via your configured provider.',
    color: 'text-electric-400',
    bg: 'bg-electric-500/10',
  },
  {
    step: '04',
    icon: Mic2,
    title: 'Listen in Both Languages',
    desc: 'Play the original and translated text as natural speech with adjustable speed and style.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
]

const WHY_CARDS = [
  { icon: ShieldCheck, title: 'Privacy First',     desc: 'History is stored locally. No text is sent to third parties without your action.',    color: 'text-violet-400' },
  { icon: Layers,      title: 'Provider Agnostic', desc: 'Swap translation or TTS providers by changing a single env variable — no code changes.', color: 'text-cyan-400' },
  { icon: Globe2,      title: '49+ Languages',     desc: 'From Hindi to Hebrew, Japanese to Swahili — detection, translation, and voice.',         color: 'text-amber-400' },
  { icon: Mic2,        title: 'Natural Speech',    desc: 'Browser TTS works offline. Cloud providers add studio-quality neural voices.',           color: 'text-emerald-400' },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <>
      <Hero />

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-2">Workflow</p>
          <h2 className="text-3xl font-bold text-slate-100">How It Works</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color, bg }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 space-y-3 relative overflow-hidden"
            >
              <span className="absolute top-4 right-4 text-4xl font-black text-white/3 font-mono select-none">
                {step}
              </span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-slate-200">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-10">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/translate')}
            className="btn-primary text-base px-8 py-3.5"
          >
            Try It Now
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* Why PolyVoice */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400 mb-2">Features</p>
          <h2 className="text-3xl font-bold text-slate-100">Why PolyVoice AI</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY_CARDS.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5 space-y-2"
            >
              <Icon className={`w-6 h-6 ${color}`} />
              <h3 className="font-semibold text-slate-200">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick navigation */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/translate', label: 'Open Translate Studio', icon: Languages },
            { to: '/history',   label: 'View Translation History', icon: Clock },
            { to: '/settings',  label: 'Configure Settings', icon: Globe2 },
          ].map(({ to, label, icon: Icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex items-center justify-between px-5 py-4 rounded-xl border border-white/5
                         bg-navy-800/50 hover:border-violet-500/20 hover:bg-navy-700/50 transition-all group"
            >
              <span className="flex items-center gap-3 text-sm text-slate-300 group-hover:text-slate-100">
                <Icon className="w-4 h-4 text-violet-400" />
                {label}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
