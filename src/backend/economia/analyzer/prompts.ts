import { DeterministicBillFlags, RawBillData } from './types'

/* ------------------------------------------------------------------ */
/*  Extraction prompt                                                   */
/* ------------------------------------------------------------------ */

/**
 * Rich extraction prompt that covers every field in RawBillData,
 * including the line-by-line billing table, SCEE credit summary, and
 * extra charges (services/installments). Mirrors the standalone
 * solar-bill-clarity OCR schema.
 *
 * Instructions: pt-BR, JSON-only output, null for missing, numbers
 * without currency symbols, dates ISO yyyy-mm-dd.
 */
export const EXTRACTION_PROMPT = `
Você é um OCR especializado em contas de energia elétrica brasileiras.
Sua única tarefa é EXTRAIR dados da fatura com máxima precisão. NÃO faça análises ou recomendações.
Retorne APENAS JSON válido, sem markdown, sem explicações fora do JSON.
Use null quando não encontrar um campo. Use números sem símbolo de moeda (apenas dígitos e ponto decimal).
Datas em formato ISO yyyy-mm-dd.

ATENÇÃO: Procure pela tabela "DESCRIÇÃO DO FATURAMENTO" ou similar com os itens cobrados linha a linha.
Capture também o resumo SCEE no rodapé (Energia Injetada, Saldo Utilizado, Saldo Atualizado, Créditos a Expirar).
Identifique cobranças extras: serviços contratados (seguros, doações) e parcelamentos separadamente.

{
  "referenceMonth": número do mês de referência (1-12),
  "referenceYear": ano de referência (ex: 2025),
  "competenceDate": "yyyy-mm-dd ou null",
  "accountHolder": "nome completo do titular ou null",
  "accountNumber": "número da conta/unidade consumidora ou null",
  "clientNumber": "número do cliente ou null",
  "instalationNumber": "número da instalação ou null",
  "distributor": "nome da distribuidora (CEMIG, CPFL, ENEL, LIGHT, COELBA, ENERGISA, etc) ou null",
  "consumerClass": "classe de consumo (Residencial, Comercial, Industrial, Rural) ou null",
  "tariffModality": "modalidade tarifária (Convencional, Branca, Horosazonal Verde, Horosazonal Azul) ou null",
  "connectionType": "OBRIGATÓRIO — monofasico | bifasico | trifasico. Procure em TODA a conta: dados técnicos, tipo de ramal, número de fases. Pistas: trifásico/3F = trifasico; bifásico/2F = bifasico; monofásico/1F = monofasico. Infira pelo custo de disponibilidade se necessário.",
  "tariffPeriod": "período da bandeira tarifária (ex: Verde: 07/01 - 04/02) ou null",
  "billingDays": número de dias do período de faturamento ou null,
  "readingPeriodFrom": "yyyy-mm-dd — data início leitura ou null",
  "readingPeriodTo": "yyyy-mm-dd — data fim leitura ou null",
  "creditExpiryDate": "yyyy-mm-dd — data de expiração dos créditos mais antigos ou null",

  "monitoredGenerationKwh": geração monitorada em kWh ou null,
  "billedConsumptionKwh": consumo faturado (após compensações) em kWh ou null,
  "consumptionKwh": consumo medido total em kWh ou null,
  "realConsumptionKwh": consumo real estimado (medido + compensado) em kWh ou null,
  "injectedEnergyKwh": energia injetada na rede em kWh ou null,
  "compensatedEnergyKwh": energia compensada nesta UC em kWh ou null,
  "previousCreditsKwh": saldo anterior de créditos em kWh ou null,
  "currentCreditsKwh": saldo atual/final de créditos em kWh ou null,
  "expectedGenerationKwh": geração esperada pelo projeto em kWh ou null,
  "generationEfficiency": eficiência de geração (0-1) ou null,
  "meterReadingCurrent": leitura atual do medidor em kWh ou null,
  "meterReadingPrevious": leitura anterior do medidor em kWh ou null,

  "demandContractedKw": demanda contratada em kW (Grupo A) ou null,
  "demandMeasuredKw": demanda medida em kW ou null,

  "totalBillValue": valor total da fatura a pagar em R$ ou null,
  "totalAmount": valor total final confirmado (igual a totalBillValue) em R$ ou null,
  "energyCost": custo de energia cobrado (TE + TUSD após compensações) em R$ ou null,
  "availabilityCost": custo de disponibilidade/mínimo obrigatório em R$ ou null,
  "publicLightingCost": contribuição de iluminação pública (CIP/COSIP) em R$ ou null,
  "icmsCost": valor do ICMS cobrado (pode ser 0 se compensado) em R$ ou null,
  "pisCost": valor do PIS cobrado em R$ ou null,
  "cofinsCost": valor do COFINS cobrado em R$ ou null,
  "pisCofinsCost": soma de PIS + COFINS em R$ ou null,
  "tariffPerKwh": tarifa total por kWh (TE + TUSD) em R$/kWh ou null,
  "tariffTeValue": tarifa de energia TE em R$/kWh ou null,
  "tariffTusdValue": tarifa TUSD em R$/kWh ou null,
  "tariffFlag": "bandeira tarifária (verde, amarela, vermelha 1, vermelha 2) ou null",
  "tariffFlagCost": custo adicional da bandeira em R$ ou null,
  "sectoralCharges": encargos setoriais (CDE, PROINFA, etc) em R$ ou null,
  "fineAmount": multas por atraso em R$ ou null,
  "interestAmount": juros por atraso em R$ ou null,
  "otherCharges": soma de outras cobranças não categorizadas em R$ ou null,
  "estimatedSavings": economia estimada pelo solar este mês em R$ ou null,

  "billingItems": [],
  "creditSummary": {},
  "extraCharges": [],
  "alerts": [],
  "aiAnalysis": null,
  "aiExplanations": {},
  "aiRecommendations": [],
  "billScore": null,

  "billing_table_items": [
    {
      "description": "NOME EXATO da linha como aparece na tabela DESCRIÇÃO DO FATURAMENTO (ex: Energia Consumida Faturada TE, Energia Atv Inj TE mUC, Custo de Disponibilidade, etc)",
      "quantity_kwh": quantidade_em_kWh_ou_null,
      "unit_price": preco_unitario_R$_por_kWh_ou_null,
      "total_value": valor_total_R$_positivo_ou_negativo,
      "icms_base": base_de_calculo_ICMS_R$_ou_null,
      "icms_rate": aliquota_ICMS_percentual_ou_null,
      "icms_value": valor_ICMS_R$_ou_null,
      "is_credit": true_se_item_negativo_false_se_positivo
    }
  ],

  "scee_injected_kwh": energia_injetada_HFP_no_mes_kWh_ou_null,
  "scee_used_kwh": saldo_utilizado_no_mes_kWh_ou_null,
  "scee_balance_kwh": saldo_atualizado_kWh_ou_null,
  "scee_expiring_kwh": creditos_a_expirar_proximo_mes_kWh_ou_null,

  "service_items": [
    {
      "description": "NOME EXATO do serviço como aparece na conta (seguros, doações, planos contratados)",
      "value": valor_em_R$
    }
  ],

  "installment_items": [
    {
      "description": "NOME EXATO do parcelamento (ex: Parcelamento Normal 3/12)",
      "value": valor_mensal_em_R$,
      "remaining_installments": parcelas_restantes_ou_null
    }
  ]
}

REGRAS CRÍTICAS:
1. Retorne APENAS o JSON, sem markdown, sem \`\`\`, sem explicações
2. Use ponto decimal para números (ex: 123.45, não 123,45)
3. Para valores monetários, extraia APENAS o número sem R$
4. Para kWh, extraia APENAS o número sem unidade
5. Se um campo não existe na conta, use null
6. Para campos de lista, retorne array vazio [] se não encontrar
7. Items de crédito (compensação solar) têm valores NEGATIVOS — mantenha o sinal negativo em total_value
8. O resumo SCEE aparece no rodapé: Energia Injetada HFP, Saldo utilizado, Saldo atualizado, Créditos a Expirar
`

/* ------------------------------------------------------------------ */
/*  Analysis prompt                                                     */
/* ------------------------------------------------------------------ */

/**
 * Builds a pt-BR specialist analysis prompt embedding the extracted
 * raw data and deterministic flags. Returns JSON matching SpecialistAnalysis.
 */
export function buildAnalysisPrompt(
  raw: RawBillData,
  flags: DeterministicBillFlags,
): string {
  return `
Você é um professor especialista em contas de energia elétrica e geração distribuída no Brasil.
Sua missão é explicar a conta para o cliente de forma didática, precisa e sem jargões.
Analise os dados abaixo e produza APENAS JSON válido, sem markdown, sem explicações fora do JSON.

═══════════════════════════════════════
DADOS EXTRAÍDOS DA FATURA
═══════════════════════════════════════
${JSON.stringify(raw, null, 2)}

═══════════════════════════════════════
BANDEIRAS DETERMINÍSTICAS (calculadas matematicamente)
═══════════════════════════════════════
${JSON.stringify(flags, null, 2)}

Com base nessas informações, retorne APENAS o seguinte JSON:

{
  "aiAnalysis": "Resumo executivo em português — 3 a 5 frases cobrindo: o que aconteceu nesta conta, como o solar performou, e o ponto mais importante para o cliente. Use valores reais da conta.",
  "aiExplanations": {
    "consumption": { "title": string, "description": string },
    "solar_performance": { "title": string, "description": string, "efficiency_assessment": string },
    "availability": { "title": string, "description": string },
    "taxes": {
      "icms": { "title": string, "description": string },
      "pis_cofins": { "title": string, "description": string }
    },
    "credits": { "title": string, "description": string },
    "tariff_flag": { "title": string, "description": string },
    "extra_charges": { "title": string, "description": string }
  },
  "aiRecommendations": [
    { "priority": "alta | media | baixa", "title": string, "description": string, "estimated_savings": string | null }
  ],
  "alerts": [
    { "type": "success | info | warning | error", "icon": string, "title": string, "description": string, "action": string | null }
  ],
  "billingItems": [
    {
      "description": string,
      "quantity_kwh": number | null,
      "unit_price": number | null,
      "total_value": number,
      "icms_base": number | null,
      "icms_rate": number | null,
      "icms_value": number | null,
      "is_credit": boolean | null
    }
  ],
  "creditSummary": {
    "injected_kwh": number | null,
    "used_kwh": number | null,
    "balance_kwh": number | null,
    "expiring_kwh": number | null
  },
  "extraCharges": [
    {
      "description": string,
      "value": number,
      "type": "service | installment",
      "remaining_installments": number | null
    }
  ],
  "billScore": número de 0 a 100 baseado na sua análise (considere as bandeiras determinísticas),
  "estimatedSavings": economia estimada em R$ ou null
}

REGRAS ABSOLUTAS:
1. Use sempre os valores exatos extraídos da conta, nunca genéricos
2. Explique cada componente como se o cliente nunca tivesse visto uma conta de luz
3. Se solarCoveredMinimum = true, destaque isso positivamente
4. Liste TODOS os service_items e installment_items com nome e valor em extra_charges
5. Retorne APENAS JSON válido, sem markdown, sem texto fora do JSON
`
}
