import { motion } from 'framer-motion'
import {
  Settings, Gauge, Mic2, Languages, Globe2, Star, Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { useLanguages } from '@/hooks/useLanguages'
import { cn } from '@/utils'
import type { SpeechStyle } from '@/types'

const SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]
const STYLES: { value: SpeechStyle; label: string; desc: string }[] = [
  { value: 'natural',      label: 'Natural',         desc: 'Normal speaking pace'          },
  { value: 'slow_clear',   label: 'Slow & Clear',    desc: 'Slower pace for learning'       },
  { value: 'storytelling', label: 'Storytelling',    desc: 'Slightly slower, expressive'   },
]

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
      <Icon className="w-4 h-4 text-violet-400" />
      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
    </div>
  )
}

export function SettingsPage() {
  const { settings, updateSettings, toggleFavoriteLanguage, clearHistory, history } = useAppStore()
  const languages = useLanguages()

  function handleClearHistory() {
    if (window.confirm(`Delete all ${history.length} history entries?`)) {
      clearHistory()
      toast.success('History cleared')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3 mb-1">
          <Settings className="w-7 h-7 text-violet-400" />
          Settings
        </h1>
        <p className="text-slate-500">Customise speech, language defaults, and preferences.</p>
      </motion.div>

      {/* Speech settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-5 sm:p-6 space-y-5"
      >
        <SectionHeader icon={Mic2} title="Speech Settings" />

        {/* Speed */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-slate-500" />
            Playback Speed
            <span className="ml-auto font-mono text-violet-300">{settings.speechSpeed}×</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => updateSettings({ speechSpeed: s })}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-mono transition-colors',
                  settings.speechSpeed === s
                    ? 'bg-violet-500/25 text-violet-200 border border-violet-500/40'
                    : 'bg-navy-700/50 text-slate-400 border border-white/5 hover:text-slate-200',
                )}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Reading Style</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {STYLES.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => updateSettings({ speechStyle: value })}
                className={cn(
                  'p-3 rounded-xl text-left border transition-all',
                  settings.speechStyle === value
                    ? 'border-violet-500/40 bg-violet-500/10 text-violet-200'
                    : 'border-white/5 bg-navy-800/50 text-slate-400 hover:border-white/10',
                )}
              >
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs opacity-70 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-600">
            Note: Style approximations use speed adjustments for browser TTS. Providers like Google or Azure
            support native voice styles where available.
          </p>
        </div>
      </motion.div>

      {/* Translation settings */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 sm:p-6 space-y-5"
      >
        <SectionHeader icon={Languages} title="Translation Defaults" />

        {/* Auto-detect toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Auto-detect source language</p>
            <p className="text-xs text-slate-500">Detect language automatically when analyzing text</p>
          </div>
          <button
            onClick={() => updateSettings({ autoDetect: !settings.autoDetect })}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors',
              settings.autoDetect ? 'bg-violet-600' : 'bg-navy-600',
            )}
            role="switch"
            aria-checked={settings.autoDetect}
          >
            <span
              className={cn(
                'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                settings.autoDetect ? 'translate-x-6' : 'translate-x-1',
              )}
            />
          </button>
        </div>

        {/* Default target */}
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Default Target Language</label>
          <select
            value={settings.defaultTargetLanguage}
            onChange={(e) => updateSettings({ defaultTargetLanguage: e.target.value })}
            className="input-base text-sm"
            aria-label="Default target language"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name} ({l.code})
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Favourite languages */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-5 sm:p-6 space-y-4"
      >
        <SectionHeader icon={Star} title="Favourite Languages" />
        <p className="text-xs text-slate-500">
          Starred languages appear at the top of the target language picker for quick access.
        </p>
        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
          {languages.map((lang) => {
            const isFav = settings.favoriteLanguages.includes(lang.code)
            return (
              <button
                key={lang.code}
                onClick={() => toggleFavoriteLanguage(lang.code)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all',
                  isFav
                    ? 'bg-amber-500/15 text-amber-200 border-amber-500/30'
                    : 'bg-navy-700/40 text-slate-400 border-white/5 hover:border-white/10',
                )}
                aria-pressed={isFav}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                <Star
                  className={cn(
                    'w-3 h-3',
                    isFav ? 'fill-amber-400 text-amber-400' : 'text-slate-600',
                  )}
                />
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Display preferences */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-5 sm:p-6 space-y-4"
      >
        <SectionHeader icon={Globe2} title="Display Preferences" />
        {(
          [
            { key: 'showInsights', label: 'Show Text Insights', desc: 'Word count, sentence count, reading time' },
            { key: 'showHistory',  label: 'Show History Panel', desc: 'Recent translations on the Translate page' },
          ] as const
        ).map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">{label}</p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
            <button
              onClick={() => updateSettings({ [key]: !settings[key] })}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                settings[key] ? 'bg-violet-600' : 'bg-navy-600',
              )}
              role="switch"
              aria-checked={settings[key]}
            >
              <span
                className={cn(
                  'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  settings[key] ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
          </div>
        ))}
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-5 sm:p-6 space-y-3 border-red-500/10"
      >
        <SectionHeader icon={Trash2} title="Data Management" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-300">Clear Translation History</p>
            <p className="text-xs text-slate-500">
              {history.length} saved entr{history.length === 1 ? 'y' : 'ies'} — stored locally in your browser
            </p>
          </div>
          <button
            onClick={handleClearHistory}
            disabled={history.length === 0}
            className="btn-secondary text-xs py-1.5 px-3 gap-1 border-red-500/20 text-red-400
                       hover:bg-red-500/10 hover:border-red-500/40 disabled:opacity-30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
        </div>
      </motion.div>
    </div>
  )
}
