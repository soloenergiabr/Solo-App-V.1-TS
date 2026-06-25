'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BillScoreGaugeProps {
  score: number
  label?: string
  size?: 'sm' | 'lg'
}

const getScoreConfig = (s: number) => {
  if (s >= 80) return { color: '#22c55e', trackColor: '#22c55e33', label: 'Excelente', description: 'Conta otimizada' }
  if (s >= 65) return { color: '#f59e0b', trackColor: '#f59e0b33', label: 'Bom', description: 'Pequenas melhorias possíveis' }
  if (s >= 45) return { color: '#f97316', trackColor: '#f9731633', label: 'Regular', description: 'Atenção recomendada' }
  return { color: '#ef4444', trackColor: '#ef444433', label: 'Crítico', description: 'Requer ação imediata' }
}

export function BillScoreGauge({ score, label, size = 'sm' }: BillScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score))
  const cfg = getScoreConfig(clamped)

  const radius = 54
  const strokeWidth = size === 'lg' ? 10 : 8
  const circumference = Math.PI * radius
  const progress = (clamped / 100) * circumference

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative" style={{ width: 160, height: 96 }}>
          <svg width="160" height="96" viewBox="0 0 120 70" className="overflow-visible">
            <path
              d="M 6 66 A 54 54 0 0 1 114 66"
              fill="none"
              stroke={cfg.trackColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            <motion.path
              d="M 6 66 A 54 54 0 0 1 114 66"
              fill="none"
              stroke={cfg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <span className="text-3xl font-bold tabular-nums" style={{ color: cfg.color }}>{clamped}</span>
            <span className="text-xs text-muted-foreground">{cfg.label}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center max-w-[160px]">{cfg.description}</p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: 64, height: 40 }}>
        <svg width="64" height="40" viewBox="0 0 120 70" className="overflow-visible">
          <path
            d="M 6 66 A 54 54 0 0 1 114 66"
            fill="none"
            stroke={cfg.trackColor}
            strokeWidth={8}
            strokeLinecap="round"
          />
          <motion.path
            d="M 6 66 A 54 54 0 0 1 114 66"
            fill="none"
            stroke={cfg.color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums pt-2" style={{ color: cfg.color }}>
          {clamped}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{label ?? cfg.label}</p>
        <p className="text-xs text-muted-foreground">{cfg.description}</p>
      </div>
    </div>
  )
}
