'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import { formatBRL } from '@/frontend/telemetry-kit'

interface CostPieChartProps {
  availabilityCost: number
  publicLightingCost: number
  uncompensatedCost: number
  icmsCost?: number
  pisCofins?: number
  extraChargesTotal?: number
  totalPaid: number
}

const SEGMENTS = [
  { key: 'availability',  label: 'Disponibilidade',        color: '#FF481E' },
  { key: 'cip',           label: 'Ilum. Pública (CIP)',    color: '#FF7A45' },
  { key: 'uncompensated', label: 'Consumo não compensado', color: '#FFC200' },
  { key: 'icms',          label: 'ICMS',                   color: '#9E2A19' },
  { key: 'piscofins',     label: 'PIS/COFINS',             color: '#C44020' },
  { key: 'extras',        label: 'Serviços/Parcelas',      color: '#E36040' },
]

const fmt = (v: number) => formatBRL(v)

const CustomTooltip = ({ active, payload, total }: any) => {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
  return (
    <div className="bg-card border border-border px-3 py-2 shadow-xl text-sm rounded-lg">
      <p className="font-semibold text-foreground">{item.name}</p>
      <p className="text-muted-foreground tabular-nums">{fmt(item.value)} · {pct}%</p>
    </div>
  )
}

export function CostPieChart({
  availabilityCost,
  publicLightingCost,
  uncompensatedCost,
  icmsCost = 0,
  pisCofins = 0,
  extraChargesTotal = 0,
  totalPaid,
}: CostPieChartProps) {
  const raw = [
    { ...SEGMENTS[0], value: Math.max(0, availabilityCost) },
    { ...SEGMENTS[1], value: Math.max(0, publicLightingCost) },
    { ...SEGMENTS[2], value: Math.max(0, uncompensatedCost) },
    { ...SEGMENTS[3], value: Math.max(0, icmsCost) },
    { ...SEGMENTS[4], value: Math.max(0, pisCofins) },
    { ...SEGMENTS[5], value: Math.max(0, extraChargesTotal) },
  ]
  const data = raw.filter((d) => d.value > 0)
  const total = data.reduce((s, d) => s + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="border border-border bg-card p-5 rounded-lg">
        <p className="solo-label mb-2">Composição de custos</p>
        <p className="text-sm text-muted-foreground">Dados insuficientes para exibir o gráfico.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="border border-border bg-card p-5 rounded-lg"
    >
      <p className="solo-label mb-3">Composição de custos</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={entry.key} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip total={total} />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-xs text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
