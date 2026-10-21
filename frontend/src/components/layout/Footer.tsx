import { Globe2, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-violet-500/10 bg-navy-900/60 backdrop-blur-md mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                <Globe2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gradient">PolyVoice AI</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every Language. Every Story. One Voice.
              <br />
              Smart language detection, translation & voice studio.
            </p>
          </div>

          {/* Tech stack */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Built With</h3>
            <ul className="space-y-1.5 text-sm text-slate-500">
              {[
                'React 18 + TypeScript + Vite',
                'Tailwind CSS + Framer Motion',
                'Python + FastAPI',
                'Lingua Language Detector',
                'Pluggable Translation & TTS Providers',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Languages & Privacy */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Supported Languages</h3>
            <p className="text-sm text-slate-500 mb-3">
              49 languages including English, Hindi, Marathi, Tamil, Telugu,
              Bengali, Spanish, French, German, Japanese, Korean, Arabic, and more.
            </p>
            <p className="text-xs text-slate-600">
              🔒 Translation history is stored locally in your browser only.
              No text is sent to third parties without your explicit action.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-violet-500/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <span>© {new Date().getFullYear()} PolyVoice AI. Open source project.</span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-violet-400 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            View on GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
