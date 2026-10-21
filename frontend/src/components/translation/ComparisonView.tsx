import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Copy, Download, ArrowLeftRight, CheckCheck, FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '@/store/useAppStore'
import { useTranslation } from '@/hooks/useTranslation'
import { copyToClipboard, downloadText } from '@/utils'
import { Badge } from '@/components/ui/Badge'

export function ComparisonView() {
  const { translationResult, setTargetLanguage, setDetectionResult } = useAppStore()
  const { translate } = useTranslation()
  const [copiedLeft, setCopiedLeft] = useState(false)
  const [copiedRight, setCopiedRight] = useState(false)

  if (!translationResult) return null

  const {
    original_text,
    translated_text,
    source_language,
    source_language_name,
    target_language,
    target_language_name,
  } = translationResult

  async function handleCopy(text: string, side: 'left' | 'right') {
    const ok = await copyToClipboard(text)
    if (ok) {
      if (side === 'left') {
        setCopiedLeft(true)
        setTimeout(() => setCopiedLeft(false), 2000)
      } else {
        setCopiedRight(true)
        setTimeout(() => setCopiedRight(false), 2000)
      }
      toast.success('Copied to clipboard')
    } else {
      toast.error('Could not copy — please select and copy manually')
    }
  }

  function handleDownload() {
    const content = [
      `PolyVoice AI — Translation`,
      `Original Language: ${source_language_name} (${source_language})`,
      `Translated Language: ${target_language_name} (${target_language})`,
      '',
      '--- ORIGINAL ---',
      original_text,
      '',
      '--- TRANSLATION ---',
      translated_text,
    ].join('\n')
    downloadText(content, `translation-${target_language}.txt`)
    toast.success('Downloaded translation.txt')
  }

  function handleSwapAndRetranslate() {
    // Swap source/target and re-translate
    const prevTarget = target_language
    setTargetLanguage(source_language)
    setDetectionResult({
      language_code: prevTarget,
      language_name: target_language_name,
      confidence: null,
      confidence_label: 'Swapped',
      alternatives: [],
      is_reliable: true,
    })
    setTimeout(translate, 50)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 sm:p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-violet-400" />
          Side-by-Side Comparison
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSwapAndRetranslate}
            className="btn-ghost text-xs gap-1"
            title="Swap and re-translate"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Swap & Retranslate
          </button>
          <button
            onClick={handleDownload}
            className="btn-ghost text-xs gap-1"
            title="Download as .txt"
          >
            <Download className="w-3.5 h-3.5" />
            Download .txt
          </button>
        </div>
      </div>

      {/* Two-column cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left — Original */}
        <div className="rounded-xl border border-violet-500/15 bg-navy-900/50 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Badge variant="violet">
              Original · {source_language_name}
            </Badge>
            <button
              onClick={() => handleCopy(original_text, 'left')}
              className="btn-ghost text-xs py-1 px-2 gap-1"
            >
              {copiedLeft ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLeft ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap flex-1">
            {original_text}
          </p>
        </div>

        {/* Right — Translation */}
        <div className="rounded-xl border border-cyan-500/15 bg-navy-900/50 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Badge variant="cyan">
              Translated · {target_language_name}
            </Badge>
            <button
              onClick={() => handleCopy(translated_text, 'right')}
              className="btn-ghost text-xs py-1 px-2 gap-1"
            >
              {copiedRight ? <CheckCheck className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedRight ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap flex-1">
            {translated_text}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
