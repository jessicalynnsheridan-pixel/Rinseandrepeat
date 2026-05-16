'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercent?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: 'violet' | 'gold' | 'success' | 'dark' | 'auto'
  animated?: boolean
  className?: string
}

const sizeMap = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

// All hardcoded hex — no Tailwind token dependencies
const colorMap: Record<string, string> = {
  violet:  'bg-[#7C3AED]',
  gold:    'bg-[#7C3AED]',   // kept as alias so old code using color="gold" still works
  success: 'bg-[#16A34A]',
  dark:    'bg-[#18181B]',
  auto:    '',
}

function getAutoColor(pct: number): string {
  if (pct >= 80) return 'bg-[#16A34A]'
  if (pct >= 50) return 'bg-[#7C3AED]'
  if (pct >= 25) return 'bg-[#D97706]'
  return 'bg-[#DC2626]'
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  size = 'md',
  color = 'violet',
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)
  const fillColor = color === 'auto' ? getAutoColor(percentage) : (colorMap[color] ?? 'bg-[#7C3AED]')

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-[#71717A]">{label}</span>}
          {showPercent && (
            <span className="text-xs font-semibold text-[#3F3F46] tabular-nums">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-[#F4F4F5] rounded-full overflow-hidden', sizeMap[size])}>
        {animated ? (
          <motion.div
            className={cn('h-full rounded-full', fillColor)}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <div
            className={cn('h-full rounded-full', fillColor)}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  )
}
