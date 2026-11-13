'use client'

import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatBRL, formatKwh } from '@/frontend/telemetry-kit'
import type { BillDetail } from './types'

/* ───────────── helpers ───────────── */

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function monthName(m: number): string {
  return MONTH_NAMES[m - 1] ?? String(m)
}

/** pt-BR labels for creditSummary keys (camelCase legado e snake_case do analisador). */
const KNOWN_CREDIT_KEYS: Record<string, string> = {
  totalCredits: 'Total de créditos',
  consumption: 'Consumo',
  injected: 'Injetado',
  compensated: 'Compensado',
  balance: 'Saldo',
  previousCredits: 'Créditos anteriores',
  currentCredits: 'Créditos atuais',
  injected_kwh: 'Injetado',
  used_kwh: 'Compensado',
  balance_kwh: 'Saldo',
  expiring_kwh: 'A expirar',
}

/** Glossary of known billing terms for the line-item table tooltip. */
const GLOSSARY: Record<string, string> = {
  SCEE: 'Sistema de Compensação de Energia Elétrica',
  ICMS: 'Imposto sobre Circulação de Mercadorias e Serviços',
  'PIS/COFINS': 'Contribuições para Programas de Integração Social e Financiamento da Seguridade Social',
  CIP: 'Contribuição de Iluminação Pública',
  TE: 'Tarifa de Energia',
  TUSD: 'Tarifa de Uso do Sistema de Distribuição',
  Bandeira: 'Bandeira Tarifária — sinalização do custo real da energia',
}

/** Formats a pt-BR label for connectionType. */
function connectionLabel(v: string | null): string {
  if (!v) return '—'
  const map: Record<string, string> = {
    monofasico: 'Monofásico',
    bifasico: 'Bifásico',
    trifasico: 'Trifásico',
  }
  return map[v.toLowerCase()] ?? v
}

/** Formats a date string (ISO or pt-BR) for display. */
function formatDate(d: string | null): string {
  if (!d) return '—'
  try {
    // Datas puras (@db.Date) chegam em UTC; sem timeZone o Brasil mostra o dia anterior.
    return new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  } catch {
    return d
  }
}

/* ───────────── sub-components ───────────── */

function GeneralInfoSection({ bill }: { bill: BillDetail }) {
  const rows: Array<{ label: string; value: string }> = [
    { label: 'Distribuidora', value: bill.distributor ?? '—' },
    {
      label: 'Mês de Referência',
      value: `${monthName(bill.referenceMonth)}/${bill.referenceYear}`,
    },
    { label: 'Nº da UC', value: bill.consumerUnitName ?? '—' },
    { label: 'Tipo de Ligação', value: connectionLabel(bill.connectionType) },
    { label: 'Classe', value: bill.consumerClass ?? '—' },
    { label: 'Bandeira Tarifária', value: bill.tariffFlag ?? '—' },
    { label: 'Período de Leitura', value: `${formatDate(bill.readingPeriodFrom)} — ${formatDate(bill.readingPeriodTo)}` },
  ]

  return (
    <div className="space-y-1">
      <h4 className="solo-label text-sm font-semibold text-foreground mb-2">
        Informações Gerais
      </h4>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="text-muted-foreground">{r.label}</dt>
            <dd className="text-foreground font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function CreditSummarySection({ creditSummary }: { creditSummary: Record<string, unknown> | null }) {
  if (!creditSummary || Object.keys(creditSummary).length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      <h4 className="solo-label text-sm font-semibold text-foreground mb-2">
        Saldo SCEE — Sistema de Compensação
      </h4>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {Object.entries(creditSummary).map(([key, value]) => (
          <div key={key} className="contents">
            <dt className="text-muted-foreground">
              {KNOWN_CREDIT_KEYS[key] ?? key}
            </dt>
            <dd className="text-foreground font-medium">
              {/* Créditos SCEE são energia (kWh), não dinheiro. */}
              {typeof value === 'number'
                ? formatKwh(value)
                : String(value ?? '—')}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Aceita o formato legado (camelCase) e o salvo pelo analisador (RawBillLineItem). */
interface BillingItem {
  description?: string
  quantity?: number | null
  quantity_kwh?: number | null
  unit?: string
  unitPrice?: number | null
  unit_price?: number | null
  total?: number | null
  total_value?: number | null
  type?: string
  is_credit?: boolean | null
}

function BillingItemsTable({ billingItems }: { billingItems: unknown[] | null }) {
  if (!billingItems || billingItems.length === 0) {
    return null
  }

  const items = billingItems as BillingItem[]

  /** Check whether a description contains a glossary term. */
  function glossaryTerm(desc: string): string | null {
    const upper = desc.toUpperCase()
    for (const [term] of Object.entries(GLOSSARY)) {
      if (upper.includes(term.toUpperCase())) return term
    }
    return null
  }

  return (
    <div className="space-y-1">
      <h4 className="solo-label text-sm font-semibold text-foreground mb-2">
        Tabela de Faturamento Linha a Linha
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Unidade</TableHead>
            <TableHead className="text-right">Preço Unitário</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, idx) => {
            const desc = item.description ?? ''
            const term = glossaryTerm(desc)
            const isCredit = item.type === 'credit' || item.is_credit === true
            const quantity = item.quantity ?? item.quantity_kwh
            const unit = item.unit ?? (item.quantity_kwh != null ? 'kWh' : undefined)
            const unitPrice = item.unitPrice ?? item.unit_price
            const total = item.total ?? item.total_value
            return (
              <TableRow key={idx} className={isCredit ? 'text-success' : ''}>
                <TableCell>
                  <span className="flex items-center gap-1">
                    {desc}
                    {term && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 shrink-0 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-60">
                          <p className="text-xs">
                            <strong>{term}:</strong> {GLOSSARY[term]}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-right">{quantity ?? '—'}</TableCell>
                <TableCell className="text-right">{unit ?? '—'}</TableCell>
                <TableCell className="text-right">
                  {unitPrice != null ? formatBRL(unitPrice, { cents: true }) : '—'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {total != null ? formatBRL(total, { cents: true }) : '—'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function TaxesAndEfficiencySection({ bill }: { bill: BillDetail }) {
  const hasAny =
    bill.icmsCost != null || bill.pisCofinsCost != null || bill.generationEfficiency != null

  if (!hasAny) return null

  return (
    <div className="space-y-1">
      <h4 className="solo-label text-sm font-semibold text-foreground mb-2">
        Tributos e Eficiência
      </h4>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <div className="contents">
          <dt className="text-muted-foreground">ICMS</dt>
          <dd className="text-foreground font-medium">
            {bill.icmsCost != null ? formatBRL(bill.icmsCost, { cents: true }) : '—'}
          </dd>
        </div>
        <div className="contents">
          <dt className="text-muted-foreground">PIS/COFINS</dt>
          <dd className="text-foreground font-medium">
            {bill.pisCofinsCost != null ? formatBRL(bill.pisCofinsCost, { cents: true }) : '—'}
          </dd>
        </div>
        <div className="contents">
          <dt className="text-muted-foreground">Eficiência de geração</dt>
          <dd className="text-foreground font-medium">
            {bill.generationEfficiency != null
              ? `${(bill.generationEfficiency * 100).toFixed(1)}%`
              : '—'}
          </dd>
        </div>
      </dl>
    </div>
  )
}

/* ───────────── main component ───────────── */

export function TechnicalDataViewer({ bill }: { bill: BillDetail }) {
  const [open, setOpen] = useState(false)

  const hasCreditSummary =
    bill.creditSummary != null && Object.keys(bill.creditSummary).length > 0
  const hasBillingItems =
    bill.billingItems != null && Array.isArray(bill.billingItems) && bill.billingItems.length > 0
  const hasTaxes =
    bill.icmsCost != null || bill.pisCofinsCost != null || bill.generationEfficiency != null

  const hasAnyData = hasCreditSummary || hasBillingItems || hasTaxes

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors rounded-t-3xl">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Dados Técnicos da Fatura
            </h3>
            <ChevronDown
              className={`size-4 text-muted-foreground transition-transform duration-200 ${
                open ? 'rotate-180' : ''
              }`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            <GeneralInfoSection bill={bill} />

            {!hasAnyData ? (
              <p className="text-sm text-muted-foreground py-2">
                Nenhum dado técnico disponível.
              </p>
            ) : (
              <>
                <CreditSummarySection creditSummary={bill.creditSummary} />
                <BillingItemsTable billingItems={bill.billingItems} />
                <TaxesAndEfficiencySection bill={bill} />
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
