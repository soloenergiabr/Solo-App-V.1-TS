'use client'

import { motion } from 'framer-motion'
import { Info, Package, CreditCard } from 'lucide-react'

interface ExtraCharge {
  description: string
  value: number
  type: 'service' | 'installment'
  remaining_installments?: number
}

interface CostCompositionCardProps {
  availabilityCost: number
  publicLightingCost: number
  uncompensatedCost: number
  extraCharges?: ExtraCharge[]
  connectionType?: string | null
}

const connectionTypeLabel: Record<string, string> = {
  monofasico: 'Monofásico · mín. 30 kWh',
  bifasico: 'Bifásico · mín. 50 kWh',
  trifasico: 'Trifásico · mín. 100 kWh',
}

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function CostCompositionCard({
  availabilityCost,
  publicLightingCost,
  uncompensatedCost,
  extraCharges = [],
  connectionType,
}: CostCompositionCardProps) {
  const totalFixedFees = availabilityCost + publicLightingCost
  const hasUncompensated = uncompensatedCost > 1
  const services = extraCharges.filter((c) => c.type === 'service')
  const installments = extraCharges.filter((c) => c.type === 'installment')
  const hasExtras = extraCharges.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="border border-border bg-card p-5 space-y-4 rounded-lg"
    >
      <p className="solo-label">Composição da conta</p>

      <div className="space-y-1">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-foreground font-medium">Taxas fixas obrigatórias</span>
          <span className="text-sm font-semibold text-foreground tabular-nums">{fmt(totalFixedFees)}</span>
        </div>
        <div className="pl-4 space-y-0.5 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Custo de disponibilidade</span>
            <span className="tabular-nums">{fmt(availabilityCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Iluminação pública (CIP)</span>
            <span className="tabular-nums">{fmt(publicLightingCost)}</span>
          </div>
        </div>
      </div>

      {hasUncompensated && (
        <div className="flex justify-between items-center py-2 border-t border-border/50">
          <span className="text-sm text-foreground font-medium">Consumo não compensado</span>
          <span className="text-sm font-semibold text-warning tabular-nums">{fmt(uncompensatedCost)}</span>
        </div>
      )}

      {hasExtras && (
        <div className="space-y-2 border-t border-border/50 pt-3">
          {services.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Package className="size-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Serviços</span>
              </div>
              {services.map((s, i) => (
                <div key={i} className="flex justify-between items-center py-1 pl-5">
                  <span className="text-xs text-muted-foreground">{s.description}</span>
                  <span className="text-xs font-medium text-foreground tabular-nums">{fmt(s.value)}</span>
                </div>
              ))}
            </div>
          )}
          {installments.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <CreditCard className="size-3 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Parcelamentos</span>
              </div>
              {installments.map((inst, i) => (
                <div key={i} className="flex justify-between items-center py-1 pl-5">
                  <span className="text-xs text-muted-foreground">
                    {inst.description}
                    {inst.remaining_installments ? ` (${inst.remaining_installments}x restantes)` : ''}
                  </span>
                  <span className="text-xs font-medium text-foreground tabular-nums">{fmt(inst.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {connectionType && (
        <div className="flex items-start gap-2 pt-2 border-t border-border/50">
          <Info className="size-3 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            {connectionTypeLabel[connectionType] ?? connectionType}
          </p>
        </div>
      )}
    </motion.div>
  )
}
