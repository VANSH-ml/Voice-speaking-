import { useState } from 'react'
import { cn } from '@/utils'

interface TooltipProps {
  content: string
  children: React.ReactNode
  placement?: 'top' | 'bottom'
  className?: string
}

export function Tooltip({ content, children, placement = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg px-2.5 py-1.5',
            'text-xs font-medium text-white bg-navy-600 border border-violet-500/20 shadow-lg',
            placement === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
              : 'top-full mt-2 left-1/2 -translate-x-1/2',
          )}
        >
          {content}
        </span>
      )}
    </span>
  )
}
