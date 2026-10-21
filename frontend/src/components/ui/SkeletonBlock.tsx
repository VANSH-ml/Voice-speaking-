import { cn } from '@/utils'

interface SkeletonBlockProps {
  className?: string
  lines?: number
}

export function SkeletonBlock({ className, lines = 1 }: SkeletonBlockProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'skeleton h-4 rounded-md',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full',
          )}
        />
      ))}
    </div>
  )
}
