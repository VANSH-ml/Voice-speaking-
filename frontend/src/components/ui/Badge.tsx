import { cn } from '@/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'violet' | 'cyan' | 'green' | 'amber' | 'red' | 'slate'
  className?: string
}

const variants = {
  violet: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  cyan:   'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  green:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  amber:  'bg-amber-500/15 text-amber-300 border-amber-500/20',
  red:    'bg-red-500/15 text-red-300 border-red-500/20',
  slate:  'bg-slate-500/15 text-slate-400 border-slate-500/20',
}

export function Badge({ children, variant = 'violet', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
