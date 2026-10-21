import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftRight, Search, Star, Languages } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useLanguages } from '@/hooks/useLanguages'
import { useTranslation } from '@/hooks/useTranslation'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils'

export function LanguageSelector() {
  const {
    detectionResult,
    targetLanguage,
    setTargetLanguage,
    setDetectionResult,
    loading,
    settings,
    toggleFavoriteLanguage,
  } = useAppStore()
  const languages = useLanguages()
  const { translate } = useTranslation()

  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const sourceName = detectionResult?.language_name ?? 'Auto-detect'
  const sourceCode = detectionResult?.language_code ?? 'auto'

  const targetInfo = languages.find((l) => l.code === targetLanguage)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return languages.filter(
      (l) =>
        l.code !== sourceCode &&
        (l.name.toLowerCase().includes(q) ||
          l.native_name.toLowerCase().includes(q) ||
          l.code.includes(q)),
    )
  }, [languages, search, sourceCode])

  const favLangs = useMemo(
    () => languages.filter((l) => settings.favoriteLanguages.includes(l.code)),
    [languages, settings.favoriteLanguages],
  )

  function handleSwap() {
    if (!detectionResult) return
    const prev = targetLanguage
    setTargetLanguage(detectionResult.language_code)
    setDetectionResult({
      ...detectionResult,
      language_code: prev,
      language_name: languages.find((l) => l.code === prev)?.name ?? prev,
    })
  }

  function selectTarget(code: string) {
    setTargetLanguage(code)
    setOpen(false)
    setSearch('')
  }

  return (
    <div className="glass-card p-5 sm:p-6 space-y-5">
      <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
        <Languages className="w-4 h-4 text-cyan-400" />
        Translation Direction
      </h2>

      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Source */}
        <div className="flex-1 min-w-[120px] px-4 py-3 rounded-xl border border-violet-500/15 bg-navy-800/60">
          <p className="text-xs text-slate-500 mb-0.5">From</p>
          <p className="text-sm font-semibold text-slate-200 truncate">{sourceName}</p>
          {sourceCode !== 'auto' && (
            <p className="text-xs text-slate-500 font-mono uppercase">{sourceCode}</p>
          )}
        </div>

        {/* Swap */}
        <button
          onClick={handleSwap}
          disabled={!detectionResult}
          className="btn-ghost p-2.5 rounded-xl disabled:opacity-30"
          title="Swap languages"
          aria-label="Swap source and target languages"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* Target dropdown */}
        <div className="relative flex-1 min-w-[140px]">
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full px-4 py-3 rounded-xl border border-violet-500/15 bg-navy-800/60
                       text-left hover:border-violet-500/40 transition-colors"
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <p className="text-xs text-slate-500 mb-0.5">To</p>
            <p className="text-sm font-semibold text-slate-200">
              {targetInfo ? (
                <span className="flex items-center gap-1.5">
                  <span>{targetInfo.flag}</span>
                  {targetInfo.name}
                </span>
              ) : (
                targetLanguage
              )}
            </p>
          </button>

          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 top-full mt-1 z-30 w-72 rounded-2xl border border-violet-500/15
                         bg-navy-800 shadow-xl overflow-hidden"
              role="listbox"
              aria-label="Select target language"
            >
              {/* Search */}
              <div className="p-3 border-b border-violet-500/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search languages…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-base py-2 pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Favourites (only when no search) */}
              {!search && favLangs.length > 0 && (
                <div className="px-3 py-2 border-b border-violet-500/10">
                  <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" /> Favourites
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {favLangs.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => selectTarget(l.code)}
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs border transition-colors',
                          l.code === targetLanguage
                            ? 'bg-violet-500/25 text-violet-200 border-violet-500/40'
                            : 'border-violet-500/10 text-slate-400 hover:bg-violet-500/10 hover:text-violet-300',
                        )}
                      >
                        {l.flag} {l.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All languages */}
              <ul className="max-h-56 overflow-y-auto" role="list">
                {filtered.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-slate-500 text-center">No languages found</li>
                ) : (
                  filtered.map((lang) => (
                    <li key={lang.code}>
                      <button
                        onClick={() => selectTarget(lang.code)}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors',
                          lang.code === targetLanguage
                            ? 'bg-violet-500/15 text-violet-300'
                            : 'text-slate-300 hover:bg-violet-500/8 hover:text-slate-100',
                        )}
                        role="option"
                        aria-selected={lang.code === targetLanguage}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.name}</span>
                          <span className="text-slate-600 text-xs font-mono">{lang.code}</span>
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavoriteLanguage(lang.code) }}
                          className="p-1 rounded hover:bg-white/5 transition-colors"
                          aria-label={settings.favoriteLanguages.includes(lang.code) ? 'Remove from favourites' : 'Add to favourites'}
                        >
                          <Star
                            className={cn(
                              'w-3 h-3',
                              settings.favoriteLanguages.includes(lang.code)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600',
                            )}
                          />
                        </button>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </motion.div>
          )}
        </div>
      </div>

      {/* Translate button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={translate}
        disabled={loading.translate || !detectionResult}
        className="btn-primary w-full justify-center text-sm py-3"
      >
        {loading.translate ? (
          <>
            <Spinner size="sm" />
            Translating…
          </>
        ) : (
          <>
            <Languages className="w-4 h-4" />
            Translate Text
          </>
        )}
      </motion.button>

      {!detectionResult && (
        <p className="text-xs text-slate-500 text-center">
          Analyze the text first to enable translation.
        </p>
      )}
    </div>
  )
}
