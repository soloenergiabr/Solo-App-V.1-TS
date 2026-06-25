'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

type SystemStatus = 'adequate' | 'slightly_below' | 'below_needed'

interface SystemStatusCardProps {
  expectedGeneration: number
  actualGeneration: number
  status: SystemStatus
}

const statusConfig = {
  adequate: {
    color: '#22c55e',
    borderColor: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    icon: CheckCircle2,
    label: 'Sistema operando bem',
    tip: 'Continue monitorando mensalmente para garantir o desempenho.',
  },
  slightly_below: {
    color: '#FF481E',
    borderColor: 'border-primary/20',
    bg: 'bg-primary/5',
    icon: AlertTriangle,
    label: 'Geração ligeiramente abaixo',
    tip: 'Pequenas variações são normais. Verifique se há sujeira nos painéis.',
  },
  below_needed: {
    color: '#ef4444',
    borderColor: 'border-red-500/20',
    bg: 'bg-red-500/5',
    icon: XCircle,
    label: 'Geração abaixo do esperado',
    tip: 'Considere verificar: sujeira nos painéis, sombreamento, ou falha no inversor.',
  },
}

const fmt = (n: number) => n.toLocaleString('pt-BR')

export function SystemStatusCard({ expectedGeneration, actualGeneration, status }: SystemStatusCardProps) {
  const cfg = statusConfig[status]
  const Icon = cfg.icon
  const pct = expectedGeneration > 0 ? Math.round((actualGeneration / expectedGeneration) * 100) : 0
  const gap = Math.max(0, expectedGeneration - actualGeneration)
  const clampedPct = Math.min(100, Math.max(0, pct))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`border p-5 space-y-4 rounded-lg ${cfg.bg} ${cfg.borderColor}`}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${cfg.color}15` }}>
          <Icon className="h-5 w-5" style={{ color: cfg.color }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
          <p className="text-xs text-muted-foreground">{cfg.tip}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Geração real vs esperada</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: cfg.color }}>{clampedPct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: cfg.color }}
            initial={{ width: 0 }}
            animate={{ width: `${clampedPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{fmt(actualGeneration)} kWh</span>
          <span>{fmt(expectedGeneration)} kWh</span>
        </div>
      </div>

      {status !== 'adequate' && gap > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-background/60 rounded-lg border border-border/50">
          <span className="text-xs text-muted-foreground">Déficit de geração</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: cfg.color }}>{fmt(gap)} kWh</span>
        </div>
      )}
    </motion.div>
  )
}
