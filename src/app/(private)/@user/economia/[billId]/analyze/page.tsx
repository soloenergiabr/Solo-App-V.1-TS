'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { BillDetail } from '@/frontend/economia/analysis/types'
import { PageLayout, PageHeader } from '@/components/ui/page-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CostPieChart } from '@/frontend/economia/analysis/clarifier/cost-pie-chart'
import { SolarEnergyCard } from '@/frontend/economia/analysis/clarifier/solar-energy-card'
import { BillScoreGauge } from '@/frontend/economia/analysis/clarifier/bill-score-gauge'
import { BillSummaryCard } from '@/frontend/economia/analysis/clarifier/bill-summary-card'
import { CostCompositionCard } from '@/frontend/economia/analysis/clarifier/cost-composition-card'
import { SystemStatusCard } from '@/frontend/economia/analysis/clarifier/system-status-card'
import { ActionCard } from '@/frontend/economia/analysis/clarifier/action-card'
import { formatBRL } from '@/frontend/telemetry-kit'

function monthName(m: number): string {
  const names = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ]
  return names[m - 1] ?? String(m)
}

export default function AnalyzePage({ params }: { params: Promise<{ billId: string }> }) {
  const { billId } = use(params)
  const [bill, setBill] = useState<BillDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchBill() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/economia/bills/${billId}`)
        const json = await res.json()
        if (cancelled) return
        if (!res.ok || !json.success) {
          setError(json.message ?? 'Falha ao carregar fatura')
          return
        }
        setBill(json.data as BillDetail)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro inesperado')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchBill()
    return () => { cancelled = true }
  }, [billId])

  /* Loading */
  if (isLoading) {
    return (
      <PageLayout header={<PageHeader title="Análise da Conta" subtitle="Carregando..." />}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </PageLayout>
    )
  }

  /* Error */
  if (error) {
    return (
      <PageLayout
        header={
          <PageHeader
            title="Análise da Conta"
            subtitle="Erro ao carregar"
            actions={
              <Link href="/economia">
                <Button variant="ghost" size="sm"><ChevronLeft className="size-4" /> Voltar</Button>
              </Link>
            }
          />
        }
      >
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar fatura</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageLayout>
    )
  }

  /* Empty */
  if (!bill) {
    return (
      <PageLayout
        header={
          <PageHeader
            title="Análise da Conta"
            subtitle="Fatura não encontrada"
            actions={
              <Link href="/economia">
                <Button variant="ghost" size="sm"><ChevronLeft className="size-4" /> Voltar</Button>
              </Link>
            }
          />
        }
      >
        <Alert>
          <AlertTitle>Fatura não encontrada</AlertTitle>
          <AlertDescription>A fatura solicitada não está disponível ou foi removida.</AlertDescription>
        </Alert>
      </PageLayout>
    )
  }

  const refLabel = `${monthName(bill.referenceMonth)}/${bill.referenceYear}`
  const hasClarifierData = bill.monitoredGenerationKwh !== null || bill.totalAmount !== null
  const availability = bill.availabilityCost ?? 0
  const publicLighting = bill.publicLightingCost ?? 0
  const minimumPossible = availability + publicLighting

  /* Compute system status */
  let systemStatus: 'adequate' | 'slightly_below' | 'below_needed' = 'adequate'
  const actualGen = bill.monitoredGenerationKwh ?? 0
  const expectedGen = bill.expectedGenerationKwh ?? actualGen
  if (expectedGen > 0 && actualGen > 0) {
    const ratio = actualGen / expectedGen
    if (ratio < 0.7) systemStatus = 'below_needed'
    else if (ratio < 0.9) systemStatus = 'slightly_below'
  }

  /* Extra charges total */
  const extraChargesTotal = (bill.extraCharges as Array<{ value: number }> | null)
    ?.reduce((sum, c) => sum + (c.value ?? 0), 0) ?? 0

  return (
    <PageLayout
      header={
        <PageHeader
          title="Análise da Conta"
          subtitle={`${bill.consumerUnitName} — ${refLabel}`}
          actions={
            <Link href="/economia">
              <Button variant="ghost" size="sm"><ChevronLeft className="size-4" /> Voltar</Button>
            </Link>
          }
        />
      }
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Info bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{bill.distributor ?? '—'}</span>
          <span className="text-sm text-foreground font-semibold">{formatBRL(bill.amountDue)}</span>
        </div>

        {hasClarifierData ? (
          <>
            {/* Row 1: Score + Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border bg-card p-5 rounded-lg flex flex-col items-center justify-center">
                <BillScoreGauge score={bill.billScore ?? 0} size="lg" />
              </div>
              <BillSummaryCard
                totalPaid={bill.totalAmount ?? bill.amountDue}
                minimumPossible={minimumPossible}
                connectionType={bill.connectionType}
                extraChargesTotal={extraChargesTotal}
              />
            </div>

            {/* Row 2: Pie + Cost composition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CostPieChart
                availabilityCost={availability}
                publicLightingCost={publicLighting}
                uncompensatedCost={Math.max(0, (bill.totalAmount ?? bill.amountDue) - minimumPossible - extraChargesTotal)}
                icmsCost={bill.icmsCost ?? 0}
                pisCofins={bill.pisCofinsCost ?? 0}
                extraChargesTotal={extraChargesTotal}
                totalPaid={bill.totalAmount ?? bill.amountDue}
              />
              <CostCompositionCard
                availabilityCost={availability}
                publicLightingCost={publicLighting}
                uncompensatedCost={Math.max(0, (bill.billedConsumptionKwh ?? 0) - (bill.compensatedEnergyKwh ?? 0))}
                extraCharges={bill.extraCharges as Array<{ description: string; value: number; type: 'service' | 'installment'; remaining_installments?: number }> | undefined}
                connectionType={bill.connectionType}
              />
            </div>

            {/* Row 3: Solar + System status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SolarEnergyCard
                generated={actualGen}
                injected={bill.injectedEnergyKwh ?? 0}
                compensated={bill.compensatedEnergyKwh ?? 0}
                creditsBalance={bill.currentCreditsKwh ?? 0}
              />
              {(bill.expectedGenerationKwh != null && bill.monitoredGenerationKwh != null) ? (
                <SystemStatusCard
                  expectedGeneration={bill.expectedGenerationKwh}
                  actualGeneration={bill.monitoredGenerationKwh}
                  status={systemStatus}
                />
              ) : (
                <div className="border border-border bg-card p-5 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Dados de geração insuficientes para análise do sistema.</p>
                </div>
              )}
            </div>

            {/* Action card */}
            {bill.expectedGenerationKwh != null && bill.monitoredGenerationKwh != null && (
              <ActionCard
                extraGenerationNeeded={Math.max(0, bill.expectedGenerationKwh - bill.monitoredGenerationKwh)}
                expansionKwp={undefined}
                expansionModules={undefined}
              />
            )}

            {/* AI Analysis section */}
            {bill.aiAnalysis && (
              <div className="border border-border bg-card p-5 rounded-lg">
                <p className="solo-label mb-2">Resumo da análise</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{bill.aiAnalysis}</p>
              </div>
            )}
          </>
        ) : (
          <div className="border border-border bg-card p-10 rounded-lg text-center">
            <p className="text-lg font-semibold text-foreground mb-2">Análise em andamento</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Nossa inteligência artificial está analisando esta fatura. Assim que estiver disponível,
              os detalhes aparecerão aqui com gráficos e recomendações.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
