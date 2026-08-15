import type { ChargeMode } from '@/shared/gd/types'

/**
 * E-mails da geracao distribuida. HTML inline e simples de proposito: cliente de
 * e-mail nao carrega CSS externo e o conteudo precisa sobreviver a qualquer um.
 */

const BRAND = '#16a34a'

function brl(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function ptDate(value: Date | string | null): string | null {
    if (!value) return null
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function shell(title: string, body: string): string {
    return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827">
  <h1 style="font-size:20px;margin:0 0 16px;color:${BRAND}">${title}</h1>
  ${body}
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
  <p style="font-size:12px;color:#6b7280;margin:0">
    Enviado pelo Solo App — a gestao de energia do seu imovel.
  </p>
</div>`.trim()
}

export function payerInviteEmail(params: {
    payerName: string
    titularName: string
    unitName: string
    acceptUrl: string
}): string {
    return shell(
        'Acompanhe sua conta de energia',
        `
  <p style="font-size:14px;line-height:1.6">Ola, ${params.payerName}!</p>
  <p style="font-size:14px;line-height:1.6">
    <strong>${params.titularName}</strong> convidou voce para acompanhar a conta de energia da
    unidade <strong>${params.unitName}</strong> pelo Solo App. Voce vai ver o valor a pagar,
    o consumo do mes e a energia solar que abastece essa conta.
  </p>
  <p style="margin:24px 0">
    <a href="${params.acceptUrl}"
       style="background:${BRAND};color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;display:inline-block">
      Criar meu acesso
    </a>
  </p>
  <p style="font-size:13px;color:#6b7280;line-height:1.6">
    O convite vale por 7 dias. Se o botao nao funcionar, copie e cole este endereco no navegador:<br />
    <span style="word-break:break-all">${params.acceptUrl}</span>
  </p>`,
    )
}

export function chargeNotificationEmail(params: {
    payerName: string
    titularName: string
    unitName: string
    amount: number
    dueDate: Date | string | null
    mode: ChargeMode
    basisKwh: number | null
    pricePerKwh: number | null
    billFileUrl: string | null
}): string {
    const due = ptDate(params.dueDate)

    const basisLine =
        params.mode === 'per_kwh' && params.basisKwh != null && params.pricePerKwh != null
            ? `<p style="font-size:13px;color:#6b7280;margin:4px 0 0">
                 ${params.basisKwh.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kWh fornecidos
                 x ${params.pricePerKwh.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 6 })}/kWh
               </p>`
            : params.mode === 'pass_through'
              ? `<p style="font-size:13px;color:#6b7280;margin:4px 0 0">Valor integral da fatura da distribuidora.</p>`
              : `<p style="font-size:13px;color:#6b7280;margin:4px 0 0">Valor fixo combinado.</p>`

    const billLink = params.billFileUrl
        ? `<p style="font-size:13px;margin:16px 0 0">
             <a href="${params.billFileUrl}" style="color:${BRAND}">Ver a fatura da distribuidora</a>
           </p>`
        : ''

    return shell(
        `Sua conta de ${params.unitName}`,
        `
  <p style="font-size:14px;line-height:1.6">Ola, ${params.payerName}!</p>
  <p style="font-size:14px;line-height:1.6">
    ${params.titularName} registrou a conta de energia da unidade <strong>${params.unitName}</strong>.
  </p>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:20px 0">
    <p style="font-size:12px;color:#6b7280;margin:0;text-transform:uppercase;letter-spacing:.04em">Valor a pagar</p>
    <p style="font-size:28px;font-weight:bold;margin:4px 0 0">${brl(params.amount)}</p>
    ${basisLine}
    ${due ? `<p style="font-size:13px;margin:12px 0 0">Vencimento: <strong>${due}</strong></p>` : ''}
  </div>
  <p style="font-size:13px;color:#6b7280;line-height:1.6">
    Combine o pagamento diretamente com ${params.titularName}. Depois de pagar, entre no Solo App
    e confirme o pagamento para manter o historico em dia.
  </p>
  ${billLink}`,
    )
}
