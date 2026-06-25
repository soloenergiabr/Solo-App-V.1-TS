'use client'

import { motion } from 'framer-motion'
import { formatBRL } from '@/frontend/telemetry-kit'

interface BillSummaryCardProps {
  totalPaid: number
  minimumPossible: number
  connectionType?: string | null
  extraChargesTotal?: number
}

const connectionLabel: Record<string, string> = {
  monofasico: 'Monofásico',
  bifasico: 'Bifásico',
  trifasico: 'Trifásico',
}

const connectionMinKwh: Record<string, number> = {
  monofasico: 30,
  bifasico: 50,
  trifasico: 100,
}

const fmt = (v: number) => formatBRL(v)

export function BillSummaryCard({
  totalPaid,
  minimumPossible,
  connectionType,
  extraChargesTotal = 0,
}: BillSummaryCardProps) {
  const difference = totalPaid - minimumPossible
  const paidMoreThanMinimum = difference > 1
  const minKwh = connectionType ? connectionMinKwh[connectionType] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="border border-border bg-card p-5 space-y-4 rounded-lg"
    >
      <p className="solo-label">Resumo da conta</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-muted/40 border border-border rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Você pagou</p>
          <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{fmt(totalPaid)}</p>
        </div>
        <div
          className="p-4 border rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgb(255 72 30 / 0.08) 0%, rgb(255 194 0 / 0.05) 100%)',
            borderColor: 'rgb(255 72 30 / 0.25)',
          }}
        >
          <p className="text-xs text-muted-foreground mb-1">Mínimo possível</p>
          <p className="text-2xl font-bold text-foreground tabular-nums leading-none">{fmt(minimumPossible)}</p>
        </div>
      </div>

      {paidMoreThanMinimum && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-lg border border-border/50">
          <span className="text-xs text-muted-foreground">Diferença</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">{fmt(difference)}</span>
        </div>
      )}

      <div className="text-xs text-muted-foreground space-y-0.5">
        {connectionType && (
          <p>
            <span className="font-medium text-foreground">{connectionLabel[connectionType] ?? connectionType}</span>
            {minKwh && ` · mínimo ${minKwh} kWh`}
          </p>
        )}
        <p>
          Mínimo possível: {fmt(minimumPossible)} (disponibilidade + iluminação pública)
        </p>
        {extraChargesTotal > 0 && (
          <p>Parcelas/serviços extras: {fmt(extraChargesTotal)}</p>
        )}
      </div>
    </motion.div>
  )
}
