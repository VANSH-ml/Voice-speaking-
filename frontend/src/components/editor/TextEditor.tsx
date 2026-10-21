import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Upload, Trash2, Sparkles, FileText, ChevronDown, ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { useDetection } from '@/hooks/useDetection'
import { wordCount, charCount, EXAMPLE_TEXTS } from '@/utils'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/utils'

const MAX_CHARS = 10_000

export function TextEditor() {
  const { inputText, setInputText, loading } = useAppStore()
  const { analyze, isAnalyzing } = useDetection()
  const fileRef = useRef<HTMLInputElement>(null)
  const [showExamples, setShowExamples] = useState(false)

  const words = wordCount(inputText)
  const chars = charCount(inputText)
  const remaining = MAX_CHARS - chars
  const isNearLimit = remaining < 500

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value
    if (val.length > MAX_CHARS) {
      toast.error(`Maximum ${MAX_CHARS.toLocaleString()} characters allowed`)
      return
    }
    setInputText(val)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
      toast.error('Only .txt files are supported')
      return
    }
    if (file.size > 500_000) {
      toast.error('File is too large (max 500 KB)')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      if (text.length > MAX_CHARS) {
        setInputText(text.slice(0, MAX_CHARS))
        toast('File was trimmed to 10,000 characters', { icon: '✂️' })
      } else {
        setInputText(text)
        toast.success('File loaded')
      }
    }
    reader.readAsText(file, 'UTF-8')
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  function loadExample(text: string, label: string) {
    setInputText(text)
    setShowExamples(false)
    toast.success(`Loaded: ${label}`)
  }

  return (
    <div className="glass-card p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-violet-400" />
          Original Text
        </h2>
        <div className="flex items-center gap-2">
          {/* Upload */}
          <button
            className="btn-ghost text-xs py-1.5 px-3"
            onClick={() => fileRef.current?.click()}
            title="Upload a .txt file"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload .txt
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={handleFile}
            aria-label="Upload text file"
          />

          {/* Examples dropdown */}
          <div className="relative">
            <button
              className="btn-ghost text-xs py-1.5 px-3"
              onClick={() => setShowExamples((v) => !v)}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Examples
              {showExamples ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showExamples && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 z-20 w-56 rounded-xl border border-violet-500/15
                           bg-navy-800 shadow-lg overflow-hidden"
              >
                {EXAMPLE_TEXTS.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => loadExample(ex.text, ex.label)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300
                               hover:bg-violet-500/10 hover:text-violet-300 transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Clear */}
          {inputText && (
            <button
              className="btn-ghost text-xs py-1.5 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => { setInputText(''); toast('Cleared') }}
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={inputText}
        onChange={handleChange}
        placeholder="Paste your paragraph, story, or conversation in any language…"
        className={cn(
          'input-base min-h-[220px] resize-y leading-relaxed text-sm',
          isNearLimit && 'border-amber-500/40 focus:ring-amber-500/30',
        )}
        aria-label="Text input for translation"
        spellCheck={false}
      />

      {/* Footer: counts + analyze button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>{words.toLocaleString()} words</span>
          <span className="w-px h-3 bg-slate-700" />
          <span className={cn(isNearLimit ? 'text-amber-400' : '')}>
            {chars.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
          </span>
          {isNearLimit && (
            <span className="text-amber-400 font-medium">{remaining} remaining</span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={analyze}
          disabled={!inputText.trim() || isAnalyzing}
          className="btn-primary text-sm py-2.5 px-6"
        >
          {isAnalyzing ? (
            <>
              <Spinner size="sm" />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze Text
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
