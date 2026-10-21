import { Star, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { useLanguages } from '@/hooks/useLanguages'

export function FavoriteLanguages() {
  const { settings, toggleFavoriteLanguage, setTargetLanguage } = useAppStore()
  const languages = useLanguages()

  const favs = languages.filter((l) => settings.favoriteLanguages.includes(l.code))

  if (favs.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
        Favourite Languages
      </p>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {favs.map((lang) => (
            <motion.div
              key={lang.code}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full
                         border border-amber-500/20 bg-amber-500/8 text-sm text-amber-200
                         hover:border-amber-500/40 transition-colors group"
            >
              <button
                onClick={() => setTargetLanguage(lang.code)}
                className="flex items-center gap-1.5"
                title={`Translate to ${lang.name}`}
              >
                <span>{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </button>
              <button
                onClick={() => toggleFavoriteLanguage(lang.code)}
                className="p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                           hover:bg-amber-500/20 text-amber-400"
                aria-label={`Remove ${lang.name} from favourites`}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
