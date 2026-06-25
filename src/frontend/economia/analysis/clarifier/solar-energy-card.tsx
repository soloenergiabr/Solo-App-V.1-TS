'use client'

import { motion } from 'framer-motion'
import { Sun, ArrowDown, Home, Zap } from 'lucide-react'
import { formatKwh } from '@/frontend/telemetry-kit'

interface SolarEnergyCardProps {
  generated: number
  injected: number
  compensated: number
  creditsBalance: number
}

const fmt = (n: number) => formatKwh(n)

export function SolarEnergyCard({ generated, injected, compensated, creditsBalance }: SolarEnergyCardProps) {
  const selfConsumed = Math.max(0, generated - injected)
  const creditedElsewhere = Math.max(0, injected - compensated)
  const selfPct = generated > 0 ? Math.round((selfConsumed / generated) * 100) : 0
  const injectedPct = generated > 0 ? Math.round((injected / generated) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="border border-border bg-card p-5 space-y-5 rounded-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
            <Sun className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground tracking-tight">Energia solar este mês</p>
            <p className="text-xs text-muted-foreground">Destino de cada kWh gerado</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground leading-none">{fmt(generated)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">kWh gerados</p>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="space-y-0">
        {/* Self-consumed */}
        <div className="flex items-center gap-3 py-2.5 border-b border-border/50">
          <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-md bg-primary/10">
            <Home className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Autoconsumo</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">{fmt(selfConsumed)} kWh</span>
            </div>
            <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${selfPct}%` }} />
            </div>
          </div>
        </div>

        {/* Injected */}
        <div className="flex items-center gap-3 py-2.5 border-b border-border/50">
          <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-md bg-yellow-500/10">
            <ArrowDown className="h-3.5 w-3.5 text-yellow-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Injetado na rede</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">{fmt(injected)} kWh</span>
            </div>
            <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${injectedPct}%` }} />
            </div>
          </div>
        </div>

        {/* Compensated */}
        <div className="flex items-center gap-3 py-2.5">
          <div className="h-7 w-7 shrink-0 flex items-center justify-center rounded-md bg-emerald-500/10">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">Compensado</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">{fmt(compensated)} kWh</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {creditedElsewhere > 0
                ? `${fmt(creditedElsewhere)} kWh excedente → créditos`
                : 'Compensação total da energia consumida'}
            </p>
          </div>
        </div>
      </div>

      {/* Credits balance */}
      {creditsBalance > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/40 rounded-lg border border-border/50">
          <span className="text-xs text-muted-foreground">Saldo de créditos</span>
          <span className="text-sm font-semibold text-emerald-500 tabular-nums">{fmt(creditsBalance)} kWh</span>
        </div>
      )}
    </motion.div>
  )
}
