# WP-8 — Auditoria de Gap: Analisador de Contas → Solo App
> Data: 2026-07-05 · Task 7.6 do Sprint 7 · Referência: ROADMAP.md §6 Frente 3

**Escopo da auditoria:** comparação das telas/insights **voltados ao usuário** do app standalone
`solar-bill-clarity` (pasta `src/pages` e `src/components/clarifier|chat`) contra as telas
`Economia` e `Consumo` do Solo App (`src/frontend/economia`, `src/frontend/consumo`, e a página de
detalhe `src/app/(private)/@user/economia/[billId]/page.tsx`). O motor de análise (IA) já foi
portado — este documento cobre apenas a **camada de apresentação**.

**Nota metodológica:** o app standalone tem uma pasta de componentes legados e não utilizados em
nenhuma rota ativa (`CostChart.tsx`, `BillScoreHeader.tsx`, `ResultCard.tsx`, `SolarBreakdown.tsx`,
`TaxExplainer.tsx`, `RecommendationCards.tsx`, `AlertsList.tsx`, `RawDataViewer.tsx` — todos em
`src/components/`, sem nenhum `import` fora de si mesmos). Foram superados pela pasta
`src/components/clarifier/*`, que é o que realmente roda em produção (`AnalysisResult.tsx`). Esta
auditoria compara contra o que **de fato aparece na tela do usuário hoje**, não contra código morto.

---

## 1. Já coberto no app (paridade OK)

| View/insight do analisador | Onde está no app (arquivo) | Nota |
|---|---|---|
| Gauge de pontuação da conta (score 0–100) | `clarifier/BillScoreGauge.tsx` | Portado como `src/frontend/economia/analysis/bill-score-ring.tsx` (anel SVG, mesmas faixas de cor). Usado em `bill-analysis-screen.tsx`. |
| "Você pagou" vs "Mínimo obrigatório" (hero) | `clarifier/BillSummaryCard.tsx` | Idêntico em `src/frontend/economia/analysis/clarifier/bill-summary-card.tsx`, mesma lógica de mínimo por tipo de ligação. |
| Donut "Composição do gasto" (disponibilidade, CIP, não compensado, ICMS, PIS/COFINS, extras) | `clarifier/CostPieChart.tsx` | Portado 1:1 em `analysis/clarifier/cost-pie-chart.tsx`, mesmas cores/segmentos. |
| Detalhamento de taxas fixas + serviços/parcelamentos | `clarifier/CostCompositionCard.tsx` | Portado em `analysis/clarifier/cost-composition-card.tsx` (ver nota de estilo na seção 3). |
| Fluxo de energia solar (autoconsumo → injetado → compensado → saldo) | `clarifier/SolarEnergyCard.tsx` | Portado em `analysis/clarifier/solar-energy-card.tsx`. Pequena perda de destaque — ver seção 3. |
| "Desempenho do sistema" (% da meta de geração atingida) | `clarifier/SystemStatusCard.tsx` | Portado em `analysis/clarifier/system-status-card.tsx`. Perda de destaque visual — ver seção 3. |
| Cartão de ação/expansão ("falta gerar X kWh / +Y kWp / Z módulos") | `clarifier/ActionCard.tsx` | Portado em `analysis/clarifier/action-card.tsx`. CTA trocado de WhatsApp para `/support` (aceitável para app já autenticado). |
| Dados técnicos colapsáveis (info geral, saldo SCEE, tabela de faturamento linha a linha com glossário, tributos/eficiência) | Seção `Collapsible` em `pages/AnalysisResult.tsx` (linhas 670–818) | Portado como componente próprio `analysis/technical-data-viewer.tsx`, com o mesmo padrão de tooltip/glossário (`GLOSSARY` dict). Bug de formatação pontual — ver seção 3. |
| Resumo textual da IA (`ai_analysis`) | `AnalysisResult.tsx` (bloco "Análise da IA") | Portado (`bill.aiAnalysis` em `bill-analysis-screen.tsx`). |
| Alertas da fatura | Lista inline em `AnalysisResult.tsx` (linhas 599–636) | Portado como `analysis/alerts-panel.tsx`. Perde a diferenciação visual sucesso/alerta/erro por emoji — ver seção 3. |
| Recomendações da IA (`ai_recommendations`) | **Coluna existe no banco (`bill_analyses.ai_recommendations`, `supabase/types.ts`) mas NUNCA é renderizada** — `RecommendationCards.tsx` está órfão, sem import em nenhuma rota ativa | O Solo App **renderiza de fato** via `analysis/recommendations-panel.tsx`, alimentado por `bill.aiRecommendations`. **O Solo App já supera o standalone aqui.** |
| Explicações estruturadas por item (`aiExplanations`) | Não existe equivalente estruturado no standalone (só a tabela estática com glossário) | `analysis/line-item-explanations.tsx` é uma adição própria do Solo App, mais rica que o original. |
| Chat "pergunte sobre sua conta" com sugestões de FAQ e streaming | `components/chat/BillChatDrawer.tsx` + `FAQSuggestions.tsx` | Portado em `analysis/chat/bill-chat-drawer.tsx` + `faq-suggestions.tsx`. O Solo App usa streaming de resposta (`ReadableStream`), o standalone não — **melhoria**. |
| Histórico de contas com navegação para o detalhe | Tabela "Histórico de Análises" em `pages/PropertyDetail.tsx` (linhas 354–433) | `history/bill-history.tsx`, agrupado por ano, clique na linha navega para `/economia/{id}`. Paridade funcional; ver gap de UX na seção 2 (grade visual por mês). |
| Comparação entre duas contas (métricas lado a lado com delta) | **Não existe no standalone** | `history/bill-compare.tsx` é funcionalidade exclusiva do Solo App — supera o standalone. |
| Rateio / distribuição de créditos entre unidades consumidoras | **Não existe no standalone** (app trabalha com uma propriedade por vez, sem UCs vinculadas) | `frontend/rateio/rateio-screen.tsx` + `economia/components/rateio-bar.tsx` são funcionalidade própria do Solo App, bem mais avançada do que qualquer coisa no analisador. |
| Confirmação de pagamento, PIX, código de barras | **Não existe no standalone** | `account-card.tsx`, `contas-a-pagar.tsx`, `bill-analysis-screen.tsx` — exclusivo do Solo App. |
| FAQ educacional genérica na tela de análise | **Não existe estática no standalone** (só a versão contextual, ver seção 3) | `frontend/education/educational-faq.tsx`, plugado em `bill-analysis-screen.tsx` e em `consumo-screen.tsx`. |

---

## 2. Faltando no app (o gap real)

| View/insight | O que o analisador mostra | Esforço estimado | Prioridade sugerida |
|---|---|---|---|
| **Grade mensal por conta (navegação "qual mês é esse")** | `pages/PropertyDetail.tsx`: por propriedade, (a) cartões-resumo do ano selecionado — potência instalada, geração esperada/mês, economia do ano, eficiência média + payback estimado (linhas 188–263); (b) grade de 12 células (uma por mês), cada uma navegável — mostra ícone de eficiência + kWh + R$ se já existe análise, ou um "+" para criar uma nova se o mês está vazio (linhas 288–352). O Solo App só tem `history/bill-history.tsx`: uma tabela plana agrupada por ano, **misturando todas as UCs juntas**, sem seletor de conta, sem células vazias clicáveis, sem cartões-resumo do ano (geração total, economia total, eficiência média, meses analisados, payback). | Médio | **Sprint 9** — é o gap estrutural mais visível; o dono provavelmente vai sentir falta de "abrir minha usina e ver os 12 meses" por UC. |
| **Saldo de créditos — evolução mês a mês (gráfico de tendência)** | Nenhum dos dois apps tem isso hoje de fato — o standalone só mostra o saldo do mês corrente (`credit_summary.balance_kwh` em `AnalysisResult.tsx`, linhas 716–738), sem série histórica. Mas os dados-base já existem em ambos os bancos, mês a mês, por conta (`previous_credits_kwh`/`current_credits_kwh` no standalone; `previousCreditsKwh`/`currentCreditsKwh` no Solo, `prisma/schema.prisma:502-503`). | Médio-Alto (requer endpoint de agregação por UC ao longo dos meses + componente de gráfico novo) | **Sprint 9/10** — não é estritamente "porte do que existe no analisador", é uma oportunidade latente que o PO valoriza; sinalizado aqui porque nenhum dos dois apps resolve isso hoje. |
| **FAQ contextual condicionada aos dados da fatura, com clique abrindo o chat com a pergunta pré-preenchida** | `clarifier/ContextualFAQ.tsx`: mostra de 0 a 4 cartões *condicionalmente*, com base nos números **desta fatura específica** — "Por que não paguei só o mínimo?" (se pago > mínimo + R$5), "Bandeira tarifária ativa" (se bandeira vermelha), "Você tem créditos acumulados" (se saldo > 100 kWh), "Geração abaixo do esperado" (se eficiência < 80%). Clicar em qualquer um abre o chat já com a pergunta enviada. | Baixo-Médio (lógica é quase um porte direto; só precisa de um callback para abrir o `BillChatDrawer` com a pergunta) | **Sprint 9** — ganho de percepção de "inteligência" alto para esforço baixo. |
| **Campo de vencimento de créditos (`creditExpiryDate`) não chega à tela** | `AnalysisResult.tsx` mostra explicitamente "A expirar (60 meses)" dentro do painel SCEE (linha 724). No Solo App, `creditExpiryDate` existe no schema (`prisma/schema.prisma:493`) mas **não está no tipo `BillDetail`** (`src/frontend/economia/analysis/types.ts`) — portanto nunca chega à API nem à `TechnicalDataViewer`. | Baixo (adicionar campo ao tipo + à resposta da API + uma linha em `CreditSummarySection`) | **Sprint 9** — correção pontual e barata, casa bem com o item de evolução de créditos acima. |

---

## 3. Existe no app mas pior que no analisador (melhorar)

| Item | Onde | Problema | Esforço | Prioridade |
|---|---|---|---|---|
| **Bug de unidade: créditos em kWh formatados como R$** | `src/frontend/economia/analysis/technical-data-viewer.tsx`, `CreditSummarySection` (linha ~131): `typeof value === 'number' ? formatBRL(value, { cents: true }) : ...` aplica formatação de moeda a **qualquer** valor numérico do `creditSummary`, incluindo quantidades em kWh (injetado, compensado, saldo). Resultado: algo como "R$ 350,00" onde deveria aparecer "350 kWh". O standalone (`AnalysisResult.tsx`, linhas 719–731) formata corretamente com `.toLocaleString("pt-BR")` + sufixo "kWh". | `technical-data-viewer.tsx` | Bug de exibição, ativo em produção | Baixo | **Sprint 9** — corrigir independente do escopo do WP-10, é uma tela que o usuário já vê hoje. |
| **"Desempenho do sistema" perdeu destaque visual** | `analysis/clarifier/system-status-card.tsx` vs `clarifier/SystemStatusCard.tsx` (standalone) | O standalone mostra um número grande (`text-5xl`) de % com selo colorido ("Sistema operando bem" etc.) e um marcador de meta na barra de progresso. A versão do Solo App dobra o rótulo em uma legenda pequena ao lado do ícone e remove o número grande e o marcador — mesma informação, muito menos impacto visual. | Cosmético | Baixo | pós-v1 |
| **"Créditos para outras UCs" perdeu linha própria** | `analysis/clarifier/solar-energy-card.tsx` vs `clarifier/SolarEnergyCard.tsx` (standalone) | O standalone tem uma linha dedicada, com ícone `Share2`, quando `injetado > compensado` (créditos repassados via SCEE para outras unidades). A versão do Solo App reduz isso a uma legenda de uma linha dentro do bloco "Compensado". | Cosmético | Baixo | pós-v1 |
| **Fluxo de upload sem indicador de progresso por etapas** | `economia/components/analyze-bill-dialog.tsx` vs `pages/BillAnalyze.tsx` + `AnalysisStepper.tsx` (standalone) | O standalone tem um stepper visual (enviando → extraindo → concluído/erro) com timeout de 2 min e auto-refresh. O Solo App mostra só um spinner genérico "Analisando... isso pode levar alguns segundos". Funcionalmente aceitável (o fluxo do Solo é síncrono), mas dá menos feedback em análises lentas. | UX | Baixo | pós-v1 |
| **Alertas sem diferenciação de severidade** | `analysis/alerts-panel.tsx` vs bloco de alertas em `AnalysisResult.tsx` (linhas 599–636) | O standalone diferencia sucesso (✅ verde) / erro (🔴 vermelho) / aviso (âmbar) por conteúdo do texto. O `AlertsPanel` do Solo App renderiza tudo com o mesmo estilo "destructive" (vermelho), mesmo alertas informativos ou positivos. | Cosmético/semântico | Baixo | pós-v1 |

---

## 4. Recomendação de escopo para WP-10

O conjunto mínimo que entrega a clareza de "por que paguei esse valor?" é: **(1)** corrigir o bug de
unidade em `CreditSummarySection` e expor `creditExpiryDate` — os dois são baratos e evitam que o
usuário veja números errados ou incompletos numa tela que já existe hoje; **(2)** portar a lógica do
`ContextualFAQ` para dentro de `bill-analysis-screen.tsx`, plugando os cartões condicionais no
`BillChatDrawer` já existente — é o item de maior retorno por esforço, porque reaproveita 100% da
infraestrutura de chat já pronta e dá a sensação de "o app entendeu minha conta específica";
**(3)** construir a grade mensal por conta (reaproveitando os dados já buscados por
`use-bill-history.ts`, adicionando um seletor de UC + grade de 12 células + os cartões-resumo de ano
que hoje só existem no standalone). Esse terceiro item é o de maior esforço, mas é também o gap mais
visível estruturalmente — sem ele, o usuário não tem como "abrir a usina e ver a evolução mês a mês"
por conta, que é exatamente a pergunta que antecede "por que paguei esse valor este mês e não no mês
passado". O gráfico de evolução de saldo de créditos pode ficar para depois (Sprint 10): é o item de
maior esforço de implementação (precisa de endpoint de série temporal) e, diferente dos outros três,
não é um "porte" de algo que já existe no analisador — é uma capacidade nova que nenhum dos dois apps
entrega hoje, então não deveria bloquear o restante do WP-10.
