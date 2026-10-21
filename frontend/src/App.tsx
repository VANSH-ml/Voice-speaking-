import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2, X } from 'lucide-react'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HomePage } from '@/pages/HomePage'
import { TranslatePage } from '@/pages/TranslatePage'
import { HistoryPage } from '@/pages/HistoryPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { api } from '@/services/api'
import { useAppStore } from '@/store/useAppStore'

// ── Backend health banner ─────────────────────────────────────────────────────

function BackendBanner() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking')
  const [providers, setProviders] = useState<Record<string, string>>({})
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    api.health()
      .then((h) => {
        setStatus('ok')
        setProviders(h.providers)
        // Auto-dismiss on healthy backend after 3s
        setTimeout(() => setDismissed(true), 3000)
      })
      .catch(() => setStatus('error'))
  }, [])

  if (dismissed || status === 'checking') return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        className={`fixed top-16 inset-x-0 z-40 flex items-center justify-center px-4 py-2 text-xs
          ${status === 'ok'
            ? 'bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-300'
            : 'bg-red-500/10 border-b border-red-500/20 text-red-300'
          }`}
      >
        <div className="flex items-center gap-2 max-w-4xl w-full">
          {status === 'ok' ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          )}
          {status === 'ok' ? (
            <span>
              Backend connected — translation: <b>{providers.translation}</b> · tts:{' '}
              <b>{providers.tts}</b> · detection: <b>{providers.detection}</b>
            </span>
          ) : (
            <span>
              {import.meta.env.DEV
                ? <>Backend not reachable locally. Run <code className="font-mono bg-red-500/20 px-1 rounded">uvicorn app.main:app --reload --port 8000</code> in the <code className="font-mono bg-red-500/20 px-1 rounded">backend/</code> folder.</>
                : <>Backend is temporarily unreachable. Please refresh the page or try again in a moment.</>
              }
            </span>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="ml-auto p-0.5 rounded hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Page transition wrapper ───────────────────────────────────────────────────

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

// ── Root app ──────────────────────────────────────────────────────────────────

function AppContent() {
  // Load languages on mount
  const { setLanguages } = useAppStore()
  useEffect(() => {
    api.getLanguages().then((r) => setLanguages(r.languages)).catch(console.error)
  }, [setLanguages])

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />
      <BackendBanner />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/translate" element={<PageWrapper><TranslatePage /></PageWrapper>} />
            <Route path="/history"   element={<PageWrapper><HistoryPage /></PageWrapper>} />
            <Route path="/settings"  element={<PageWrapper><SettingsPage /></PageWrapper>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0d1528',
            color: '#e2e8f0',
            border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#0d1528' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#0d1528' } },
        }}
      />
    </BrowserRouter>
  )
}
