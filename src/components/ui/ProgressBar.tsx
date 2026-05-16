'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercent?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: 'gold' | 'success' | 'ink' | 'auto'
  animated?: boolean
  className?: string
}

const sizeMap = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

const colorMap = {
  gold: 'bg-gold-500',
  success: 'bg-success',
  ink: 'bg-ink-900',
  auto: '',
}

function getAutoColor(pct: number): string {
  if (pct >= 80) return 'bg-success'
  if (pct >= 50) return 'bg-gold-500'
  if (pct >= 25) return 'bg-warning'
  return 'bg-danger'
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  size = 'md',
  color = 'gold',
  animated = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100)
  const fillColor = color === 'auto' ? getAutoColor(percentage) : colorMap[color]

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-ink-500">{label}</span>}
          {showPercent && (
            <span className="text-xs font-semibold text-ink-700 tabular-nums">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-ink-100 rounded-full overflow-hidden', sizeMap[size])}>
        {animated ? (
          <motion.div
            className={cn('h-full rounded-full', fillColor)}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <div className={cn('h-full rounded-full', fillColor)} style={{ width: `${percentage}%` }} />
        )}
      </div>
    </div>
  )
}
