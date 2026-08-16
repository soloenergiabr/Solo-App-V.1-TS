Personal View:

I Want to focused in put this app in production in mvp v1 with the possibilities
to evolver in versions:v1,v2,v3 etc.

In first hand this is an B2C2B software, Solo Ventures development for Solo
Energia that is the pilot client.

This software need to have the enduser interface and the company interface where
he can manage all clients.

the generarion section its important but the main objective its allow the
distributive generation to final cliente.

another softwares is focused in b2b for the Solar Companies but us will empower
the enduser.

for this we need to have the better logic and infrastructue to the
consuption,management billings, notifications,concessionária integrations,
automations, rateio, managements payments to the generative distribuition,
imagine can empower the simple user that person that installed and 3.000kwh
plant and split to 5 ucs, where everyone can see your acount see the befical of
the Solar Energy and pay your bills satisfied see the economy.

but not to sell them 15% of discount but 90% with your own Solar Plant.

This is our diference,to put this app in production we need allow the automative
pulls but if we dont have that allow the manual input of generation and also the
billings, we have this project that can give some guidance:
"C:\Users\mateus\OneDrive\Desktop\MSM\Solo Energia - Analisador de Contas (APP)"

I also have some questions that we need to ansewr in this sprint.

and also some adjusts in the current interface:

idont want so many sections and with an name that has the style of the brand, i
will also made an reasearch about the softwares of: sunrun, tesla and redbull
style.

maybe the names can be:

- Controle (Visualização geral com retorno de investimento,payback,visualização
  geral, podemos colocar talvez depois comparativos etc)
- Energia (Usinas, Inversores, Geração, Correlação -> Usinas com Contas)
- Consumo (Distribuição, Clientes,Ucs(Blocos consumidores ex. 5 ucs agregadas
  que consomem de tais usinas,com rateiors,pagadores, creditos por cada
  uc,credito geral, analise de cadaconta, por mes,possibilidade de automação de
  pull de contas ou input manual,possibilidade deconversarcoma propria conta, de
  conversar com a visualização geral,saber como rateiarmelgor, etc.))aqui é o
  ouro para o cliente final, the level of engineering here need be tesla /
  redbull level, with high ui/ux level level of yc startups.

- Clube Solo: (Solo Coins, Vouchers, Referrals, Shop, etc, we mayba can have an
  way of they can pay your billings with your Solo Coins)

- Suporte (Q/A, Solo Team Direclt or Solo AI for fastly help and system
  overview,see notifications and open o&m support tickets

In the admin its likebuild and total support software where the enterprise can
manage all your clients with facillite,see the o&m suport tickect, deliver to
the right team, mande cobranças and track the status,all that in an second
moment connected qith the ERP of the company you can see here an seed project
that we are working that in the future will coneect with this softare:
"C:\Users\mateus\Documents\Claude\Projects\Solo Energia\Solo OS"

remembereverything need to have the face of Solo Energia.

We need to think de trás para frente to empower firts the simple user that
install solar energy in your home and want have the control,feel inteligent and
referral because i think that when you fell inteligent for have take some
decision you referral.

ex:

Airton é um cliente que instalou energia solr ele colocou 2.000 kwh

para o projeto dele colocamos 2 inversores então é como se fossem 2 plantas no
software do fabricante isso por sí só já é uma dificuldade para o cliente
acompanhar a geração, no Solo App ele vai integrar essas 2 plantas como se fosse
uma unica usina e poder ver o geral vai poder ter uma visualização unificada e
também de cada inversor, ele vai receber umanotificação ou o time primeiro se
acontecer algo, o time recebe,edita se necessário e aprova e ai o sistema envia
direto pra ele.

Esse cliente também está distribuindo a energia para7 outros locais oque é
extremamente complexo: casa propria, casa do filho, ele tem uma casas de aluguel
pra enviar também.

Portanto a ideia é: Ele cadastra todas as ucs, define qual é geradora e qual é
consumidora, define os rateios, faz o sync com a enel se não tiver a automação
fica pendente até ser aprovado o sync, e todos os meses se tiver a automação já
puxa direto da enel e aparece cada conta associada, o software faz a analise,
mostra os resultados e o dashboard de cada conta: Se o rateio foi correto, se
teve algum problema na conta, se precisa aumentar geração ou ajustar rateio, ele
pode tambem colocar manualmente as contas se não tiver a automação da enel.

Ele também pode definir quem é o pagador daquela conta, dar um acesso para
apessoa acompanhar a propria conta e pagar dentro do app no pix e ai se tiver
solo coins que paga através de indicação a pessoa já paga com as proprias
indicações.

dessa forma fecha um ciclo completo olhando para esse caso do cliente mais
complicado se resolvermos esse problema vamos resolver o problema de todos os
clientes residencias / comerciais que fazer geração distribuída.

Além disso quem sabe o Airton não aumenta a geração dele e ai associa mais
contas e pode fazer um minihusiness of geração distribuida mandando energia para
as suas casas de aluguel? our software will alow it in the future in the
evolving this is the vision of Solo Energia - Você no Controle.

-

Data: 20 / 06 / 2026

Solo Solo App ↳ Banco de Dados: Prisma / Postgres → Docker / Dockge → VPS

Módulos CONTROLE → Usinas → Inversores

GERAÇÃO ↳ ↴

CONSUMO → Clientes → UC's

Usina X ↳ Inversor 1

↳ Inversor 2

↳ Cliente 1

↳ UC 1 → Geradora ──➔ Geração / Consumo / Créditos / RATEIO

↳ UC 2 → Geradora

↳ UC 3 → Consumidora

↳ UC 4 → Consumidora

Investimento ↳ Geração

↳ Consumo

↳ Economia

Decisões: Postgres SQL/V.1 → Supabase

Como permitir geração distribuída para o client final?

Como agregar todos os dados de uma vez?

Como notificar o client

Como fazer um design que diferencie a marca?

Como engajar o client a utilizá-lo?

Como criar uma mecânica que faça o client indicar?

Como criar uma mecânica que fidelize, dê upgrade e cross-sell?

Como encantar o client e fazer ele se sentir inteligente?

Como colocar o app em produção e permitir...

---

## 🧠 BRAINSTORMING SESSÃO 1 — Design, Estratégia e Visão Expandida

> **Data:** 2026-06-20 **Referências:** Tesla Energy, SunRun, McLaren Racing,
> Groq, GDASH **Propósito:** Pensar sem amarras — expandir a visão de produto,
> design e arquitetura

---

### 1. O DNA DE DESIGN QUE QUEREMOS

#### A Fusão de Referências

| Referência         | O que absorver                                                                                                  | Como aplicar no Solo App                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Tesla Energy**   | Clareza cirúrgica, configurador passo a passo, dados como centro, feature flags para rollout progressivo        | O Controle deve ter a mesma sensação de "configurador de energia" — o cliente vê seu sistema, entende, age                               |
| **McLaren Racing** | Papaya orange como acento, tipografia sóbria, tracking, senso de performance e precisão, carbon-fiber aesthetic | A identidade Solo já tem laranja. Elevar o tratamento: tracking mais justo, hierarquia visual mais dramática, glow effects com propósito |
| **SunRun**         | App do proprietário residencial — simplicidade, foco em savings, monitoramento sem complexidade técnica         | Nosso diferencial: dar poder ao cliente final. SunRun faz isso bem nos EUA. Queremos fazer melhor no Brasil.                             |
| **Groq**           | Velocidade como feature, minimalismo radical, feedback instantâneo                                              | O app precisa ser RÁPIDO. Não só carregar rápido — parecer rápido. Otimismo de UI, transições instantâneas                               |
| **GDASH**          | Ecossistema B2B completo, relatórios automáticos, CRM, O&M tickets                                              | A camada do integrador/empresa. O que eles fazem bem, podemos fazer com IA + arquitetura superior                                        |

#### O Manifesto de Design

```
O Solo App não é um dashboard de engenheiro.
É o "cockpit do investidor de energia".
Cada pixel deve transmitir: controle, inteligência, retorno.
```

**Princípios de Design:**

1. **Dark mode não é opção, é identidade** — o fundo escuro faz os dados
   brilharem. Como um painel de McLaren ou Tesla.

2. **Dados são o herói** — gráficos, métricas, scores. O layout existe para
   servir os dados, não o contrário.

3. **Cada tela tem um único propósito** — não poluir. Se o usuário precisa
   pensar, perdemos.

4. **Micro-interações com alma** — transições não são decoração, são orientação.
   O elemento se move para mostrar de onde veio e para onde vai.

5. **Premium sem ser pretensioso** — a elegância está na ausência do
   desnecessário.

#### Paleta de Cores Expandida

```css
/* Atual */
--brand-primary: #ff481e;
--brand-gradient: linear-gradient(135deg, #ff481e 0%, #f5a623 100%);

/* Proposta de evolução — inspirada em McLaren Papaya + Tesla + energias */
--solo-orange: #ff481e; /* Mantém — já é identidade */
--solo-orange-bright: #ff6a3d; /* Hover, glows */
--solo-gold: #f5a623; /* Economia, savings, conquistas */
--solo-energy: #4ade80; /* Geração positiva, verde energia */
--solo-energy-pulse: #22c55e; /* AO VIVO pulsante */
--solo-surface: #0c0c0c; /* Background principal — mais escuro que atual */
--solo-surface-card: #141414; /* Cards — mais contraste com bg */
--solo-surface-raised: #1a1a1a; /* Modais, dropdowns */
--solo-border: #2a2a2a; /* Bordas sutis */
--solo-text-primary: #f5f5f5; /* Texto principal */
--solo-text-secondary: #a0a0a0; /* Texto secundário */
--solo-accent-blue: #3b82f6; /* Links, actions secundárias */
--solo-alert: #ef4444; /* Alertas */
--solo-warning: #f59e0b; /* Warning */
```

#### Tipografia com Personalidade

```css
/* Sistema atual: DM Sans + Neue Montreal — já é bom */

/* Evolução: adicionar hierarquia mais dramática */
--font-display:
    "Neue Montreal", sans-serif; /* Títulos grandes — bold, tracking tight */
--font-body: "DM Sans", sans-serif; /* Corpo — legível, limpo */
--font-mono:
    "JetBrains Mono", monospace; /* Dados técnicos — kWh, valores, timestamps */
--font-feature:
    "Soho Gothic Pro", "Inter",
    sans-serif; /* Alternativa para headings em campanhas */
```

**Tratamento tipográfico:**

- Títulos de página: `font-display`, `bold`, `tracking-tight`, `text-4xl` ou
  `5xl`
- Métricas principais (kWh, R$): `font-mono`, `font-bold`, com glow em valores
  positivos
- Labels de cards: `font-body`, `text-xs`, `tracking-wide`, `uppercase` (como
  McLaren)
- Valores secundários: `font-body`, `text-secondary`, `text-sm`

---

### 2. REESTRUTURAÇÃO DO APP — NOVO MODELO MENTAL

O usuário não se importa com sua estrutura de pastas. Ele se importa com:

```
ONDE ESTOU? → O QUE POSSO FAZER AQUI? → O QUE ACONTECEU?

→ ONDE É O PRÓXIMO PASSO?
```

#### Arquitetura de Navegação Proposta

```
S                   ┌─────────────────────────────────────┐
O  Navegação        │  CONTEÚDO PRINCIPAL                  │
L  Global           │                                      │
O  (Sidebar)        │  [O HERÓI — o que importa agora]     │
                    │                                      │
┌──────────┐        │  [Métricas de suporte]               │
│ CONTROLE │        │                                      │
│          │        │  [Ações disponíveis]                  │
│ ENERGIA  │        │                                      │
│          │        │  [Timeline / Histórico]              │
│ CONSUMO  │        └─────────────────────────────────────┘
│          │
│ CLUBE    │        ┌─────────────────────────────────────┐
│          │        │  BARRA DE AÇÕES / HELP              │
│ SUPORTE  │        │  [Falar com time] [FAQ] [Tutorial]  │
└──────────┘        └─────────────────────────────────────┘
```

#### Renomeação dos Módulos (da visão do usuário)

| Nome Atual    | Novo Nome                       | Por quê                                                             |
| ------------- | ------------------------------- | ------------------------------------------------------------------- |
| Controle      | **Visão Geral**                 | "Controle" é vago. "Visão Geral" é o que é                          |
| Geração       | **Energia**                     | Geração é um aspecto. "Energia" cobre geração + usinas + inversores |
| Economia      | **Contas**                      | O usuário pensa em "minhas contas", não em "economia"               |
| Minhas Usinas | move para dentro de **Energia** | Faz parte do contexto de energia                                    |
| Consumo       | **Distribuição**                | Rateio, UCs, créditos — é sobre distribuir energia                  |
| Clube Solo    | **Clube Solo**                  | Mantém — já é forte como marca                                      |
| Suporte       | **Ajuda**                       | Mais acessível                                                      |

**Estrutura final:**

```
Sidebar (compacta):
  ☰ Visão Geral     → O cockpit, o resumo, o que importa agora
  ⚡ Energia         → Usinas, inversores, geração em tempo real
  💡 Contas          → Faturas, análise, pagamento
  🔄 Distribuição    → Consumo, rateio, UCs, créditos
  🏆 Clube Solo      → Coins, ofertas, indicações
  ❓ Ajuda           → FAQ, suporte, tickets, notificações
```

---

### 3. IDEIAS DE ALTO IMPACTO PARA O APP

#### 3.1 "Carteira de Energia" — O Conceito de Portfolio

Em vez de mostrar gráficos de engenharia, tratar a energia do cliente como **um
portfolio financeiro**:

```
MINHA CARTEIRA DE ENERGIA
┌─────────────────────────────────────┐
│ 💰 Valor do Portfolio: R$ 47.500    │  ← Payback + economia acumulada
│ 📈 Retorno Mensal: R$ 380           │  ← Economia no mês
│ ⚡ Geração do Mês: 1.240 kWh        │  ← Produção
│ 🎯 Score de Eficiência: 92/100      │  ← Métrica composta
│                                     │
│ [Ver detalhes] [Comparar com mês passado] │
└─────────────────────────────────────┘
```

Isso faz o cliente se sentir **investidor**, não apenas "dono de placa solar".

#### 3.2 Timeline Interativa de Economia

```bash
"Quanto eu já economizei desde que instalei?"
```

Uma timeline vertical que mostra mês a mês:

- Barra verde: economia gerada
- Barra cinza: quanto seria sem solar
- Pontos de interação: "Esse mês o rateio foi ajustado", "Inversor ficou 2 dias
  offline"

**Efeito emocional:** O cliente vê o valor acumulado e sente que valeu a pena.
Isso gera indicação.

#### 3.3 "Modo Apresentação" para o Cliente

Um modo de tela cheia, como um Apple Keynote, que o cliente pode:

1. Abrir no celular
2. Mostrar para um amigo na mesa do bar
3. Ver: "Instalei X painéis, já economizei R$ Y, em Z anos paga o sistema"

**Isso é uma máquina de indicação.** O cliente vira vendedor sem esforço.

#### 3.4 Feed de Atividade (como um extrato bancário)

```
HOJE
  ├─ ☀️ 08:00 — Geração iniciada: 2.4 kW
  ├─ 📊 09:15 — Análise da fatura MAR/2026 concluída
  └─ 💡 10:00 — Alerta: Inversor Sul com rendimento 15% abaixo

ONTEM
  ├─ ✅ 14:30 — Pagamento de R$ 238 confirmado (UC Casa)
  └─ 📈 18:00 — Geração total: 28.5 kWh (120% da meta)
```

Isso dá ao cliente uma **sensação de movimento**, mesmo que ele não abra o app
todo dia.

#### 3.5 Cross-Selling Inteligente

Baseado nos dados do cliente, o sistema sugere:

- "Você tem 5 UCs consumidoras — que tal virar gerador também?"
- "Sua geração excede seu consumo em 40% — quer indicar um amigo?"
- "Seu vizinho também tem energia solar — conecte a usina dele e ganhe Solo
  Coins"

#### 3.6 Notificações com Personalidade

Em vez de:

> "Sua fatura foi analisada."

Usar:

> "Airton, sua conta de MAR/2026 chegou com economia de R$ 180 — 51% a menos que
> sem solar. 🔥"

> "⚠️ Inversor Leste parou de gerar às 14h. A equipe Solo já foi notificada."

> "🎉 Você já economizou R$ 4.200 desde a instalação. Isso equivale a 42
> jantares fora!"

---

### 4. EVOLUÇÃO DA INFRAESTRUTURA — PENSANDO COMO TESLA

#### Feature Flags (como a Tesla faz)

Tesla tem **centenas de feature flags** no configurador de energia
(`TECX-XXXXX`). Isso permite:

- Rollout progressivo para países específicos
- A/B testing de fluxos
- Desligar features sem deploy
- Ativar para parceiros específicos

**Aplicação no Solo App:**

```typescript
// Sistema de feature flags
const features = {
    "rateio-automation": { enabled: true, tenants: ["solo-energia"] },
    "whatsapp-reports": { enabled: false, beta: ["cliente-x"] },
    "ai-explanations-v2": { enabled: true, rollout: 0.5 }, // 50%
    "multi-tenant": { enabled: false },
};
```

#### Performance como Diferencial

Groq construiu uma marca em torno de **velocidade**. O Solo App pode fazer o
mesmo:

- **Target:** Primeira carga < 1s (SSR + streaming)
- **Navegação:** Instantânea (prefetch + cache)
- **Dados ao vivo:** WebSocket ou SSE para atualizações em tempo real
- **Offline:** Service worker com dados do último estado conhecido

#### Logotipo Animado

Um logo da Solo Energia que **pulsa** quando o app está recebendo dados ao vivo.
Como o coração de um carro.

---

### 5. REFLEXÕES ESTRATÉGICAS

#### 5.1 O Cliente Airton é Nosso Norte

O caso do Airton (2 plantas, 7 UCs, rateio complexo) é o **cliente mais
difícil**. Se resolvermos para ele, resolvemos para todos.

**O que o Airton precisa:**

1. Ver suas 2 plantas como UMA usina virtual (unified view)
2. Distribuir crédito para 7 UCs com poucos cliques
3. Cada UC ter sua conta analisada automaticamente
4. Cada pagador ver APENAS sua conta
5. Pagar com PIX de dentro do app
6. Opcional: pagar com Solo Coins
7. Receber notificação se algo está errado
8. Indicar amigos e ganhar créditos

**E o mais importante:** O Airton não quer saber de inversor, portal,
fabricante, concessionária. Ele quer saber:

> "Quanto estou economizando? Minhas contas estão pagas? Preciso fazer algo?"

#### 5.2 B2C2B — A Estratégia de Distribuição

1. **Solo Ventures** desenvolve a plataforma
2. **Solo Energia** é o piloto (cliente âncora)
3. O **cliente final** (Airton) ama o app
4. O **integrador** (empresa que vendeu o sistema) quer ter o mesmo para seus
   clientes
5. A **plataforma** se abre para multi-tenant

Isso é mais forte que vender B2B direto, porque:

- O cliente final gera demanda pull ("eu quero o app que meu vizinho tem")
- O integrador vem até nós
- Temos dados reais de uso para melhorar o produto

#### 5.3 O Que NÃO Fazer

- Não virar um "portal de monitoramento genérico" (já existem dezenas)
- Não tentar substituir o ERP do integrador (Solo OS é outro produto)
- Não adicionar features que o cliente não pediu
- Não esquecer que mobile-first é obrigatório no Brasil

#### 5.4 Perguntas que Precisam de Resposta (para a Próxima Fase)

1. **Qual o modelo de precificação?** Assinatura mensal para o integrador? Por
   cliente? Freemium para cliente final?
2. **Quem paga?** O integrador paga SaaS + o cliente final tem o app de graça?
   Ou ambos pagam?
3. **Qual o MVP de produção?** O que é essencial para o primeiro cliente real
   (não Airton, mas um mais simples)?
4. **Como lidar com distribuidoras?** Enel, Cemig, Light, etc. — cada uma tem
   API diferente.
5. **Qual o nível de automação?** V1 manual? V2 automático? Onde está o corte?
6. **Mobile: PWA ou nativo?** PWA é mais rápido de lançar. Nativo é melhor
   experiência.

---

### 6. VISÃO EXPANDIDA — 3 CENÁRIOS PARA O FUTURO

#### Cenário A: Solo Energia Premium (6 meses)

Foco total em ser o melhor app para o cliente final da Solo Energia.

- Design da Tesla + McLaren
- IA que explica cada conta
- Rateio simples e transparente
- PIX com um clique
- Clube Solo como diferencial
- **Métrica de sucesso:** NPS > 80 dos clientes Solo Energia

#### Cenário B: Plataforma White-label (12 meses)

Abrir para integradores.

- Mesma arquitetura, multi-tenant
- Cada integrador com sua marca
- Relatórios automáticos (como GDASH)
- CRM e O&M tickets
- **Métrica de sucesso:** 10 integradores pagando assinatura

#### Cenário C: Marketplace de Energia (24 meses)

Evoluir para plataforma aberta.

- Clientes podem trocar créditos entre si
- Marketplace de ofertas (não só da Solo)
- Integração com contas de luz de qualquer distribuidora
- API pública para desenvolvedores
- **Métrica de sucesso:** 50% de market share em GD solar no Brasil

---

### 7. O QUE LEVAR DESTA SESSÃO

| Insight                                         | Ação                                           |
| ----------------------------------------------- | ---------------------------------------------- |
| Design McLaren + Tesla + Groq = energia premium | Revisar design tokens, tipografia, glows       |
| Carteira de energia como portfolio financeiro   | Criar conceito de "portfolio" no Controle      |
| Timeline interativa de economia                 | Implementar no Controle como feature hero      |
| Feed de atividade como extrato                  | Adicionar ao Controle como componente          |
| Modo apresentação para indicação                | Criar tela "compartilhar" com dados do cliente |
| Feature flags estilo Tesla                      | Implementar sistema simples de feature flags   |
| B2C2B como estratégia de distribuição           | Documentar e alinhar com stakeholders          |
| Performance como diferencial de marca           | Estabelecer SLAs de performance                |
| Airton como norte do produto                    | Usar persona Airton em todas as decisões       |

---

_Esta é uma sessão de brainstorming — nada está decidido. O próximo passo é
priorizar e transformar insights em tarefas concretas no roadmap._

---

## 🧠 BRAINSTORMING SESSÃO 2 — Aprofundamento, Refinamento e Novas Conexões

> **Data:** 2026-06-21 **Propósito:** Aprofundar as ideias da Sessão 1, conectar
> pontos, refinar conceitos e expandir para áreas ainda não exploradas

---

### 1. REFINANDO O CONCEITO DE "CARTEIRA DE ENERGIA"

#### 1.1 A Carteira como Identidade do Usuário

O conceito de "Carteira de Energia" não é só um card no dashboard — é a
**identidade financeiro-energética do cliente**. Cada cliente tem uma carteira
única que reflete:

- **Ativos:** Usinas, inversores, capacidade instalada (kWp)
- **Passivos:** UCs consumidoras, contas a pagar, débitos
- **Fluxo de caixa:** Geração mensal (receita) vs consumo mensal (despesa)
- **Patrimônio:** Economia acumulada, payback realizado, valor do sistema
- **Score de Saúde:** Eficiência composta (geração real / geração esperada)

```typescript
interface EnergyPortfolio {
    assets: {
        totalPlants: number;
        totalInverters: number;
        installedPowerKw: number;
        generationCurrentMonthKwh: number;
        generationLifetimeKwh: number;
    };
    liabilities: {
        totalConsumerUnits: number;
        pendingBills: number;
        pendingAmount: number;
        overdueBills: number;
    };
    cashflow: {
        monthlySavings: number;
        monthlyGenerationValue: number; // R$ equivalent
        monthlyConsumptionCost: number; // what it would cost without solar
        savingsPercentage: number;
    };
    equity: {
        totalInvested: number;
        totalSavedLifetime: number;
        paybackMonths: number;
        paybackProgress: number; // 0-100%
        roi: number; // return on investment percentage
    };
    healthScore: number; // 0-100 composite
}
```

#### 1.2 Visualização da Carteira

Em vez de cards estáticos, uma **visualização dinâmica**:

```
┌─────────────────────────────────────────────┐
│  MINHA CARTEIRA DE ENERGIA                   │
│                                              │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐        │
│  │R$ │  │kWh│  │R$ │  │%  │  │92 │        │
│  │380│  │1.2│  │47K│  │78 │  │/100        │
│  │/mês│  │mil│  │vida│  │eco│  │score│        │
│  └───┘  └───┘  └───┘  └───┘  └───┘        │
│   Eco     Gera    Econ    Payb    Saúde      │
│   mensal  mês     total   done              │
│                                              │
│  [📈 Ver Evolução] [📊 Comparar] [📤 Compartilhar] │
└─────────────────────────────────────────────┘
```

Cada métrica é um **cartão interativo** — clicar expande para detalhes, gráfico,
histórico.

#### 1.3 A "Roda da Carteira" (Portfolio Wheel)

Uma visualização circular que mostra a distribuição da energia:

```
  ┌─────────────┐
 ╱  GERAÇÃO     ╲       ← fatia verde (produção)
│  1.240 kWh     │
 ╲    52%        ╱
  └─────────────┘
  ┌─────────────┐
 ╱  CONSUMO     ╲       ← fatia azul (consumo)
│  890 kWh       │
 ╲    38%        ╱
  └─────────────┘
  ┌─────────────┐
 ╱  EXCEDENTE   ╲       ← fatia dourada (créditos)
│  350 kWh       │
 ╲    15%        ╱
  └─────────────┘
```

Isso comunica instantaneamente: "estou produzindo mais que consumindo" ou
"preciso ajustar".

---

### 2. O SISTEMA DE "MOMENTOS" — GAMIFICAÇÃO DO COTIDIANO

#### 2.1 Conceito

O app não deve esperar o cliente abrir — deve **criar momentos** ao longo do
mês:

| Momento                 | Quando                       | Conteúdo                                                     |
| ----------------------- | ---------------------------- | ------------------------------------------------------------ |
| **☀️ Bom Dia, Solo**    | Todo dia 6h                  | Geração de ontem, previsão de hoje, meta diária              |
| **📄 Conta Chegou**     | Quando a distribuidora emite | "Sua conta de MAI/2026 está disponível — economia de R$ 180" |
| **📊 Análise Pronta**   | Após IA processar            | Score, alertas, recomendações                                |
| **⚠️ Alerta**           | Quando algo errado           | Inversor offline, geração abaixo do esperado                 |
| **✅ Vencimento**       | 3 dias antes                 | "Sua conta vence em 3 dias — pagar com PIX?"                 |
| **🎉 Conquista**        | Marcos                       | "1 ano de geração! Você já economizou R$ 4.200"              |
| **🏆 Indicador do Mês** | Final do mês                 | "Você indicou 2 amigos esse mês — ganhou 200 Solo Coins"     |

#### 2.2 O "Resumo Semanal" (como Spotify Wrapped, mas semanal)

Uma notificação push + tela especial:

```
Seu Resumo de Energia — Semana 25
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
☀️ Geração: 287 kWh (equivalente a 28 dias de TV)
💰 Economia: R$ 86
🌳 CO₂ evitado: 42 kg (equivalente a 3 árvores)
📊 Score: 94/100 — excelente!

[Ver completo] [Compartilhar]
```

#### 2.3 Metas e Desafios

O cliente pode definir metas e o app acompanha:

- "Quero economizar R$ 2.000 esse ano" → barra de progresso
- "Quero atingir 100% de compensação" → sugestões de ajuste de rateio
- "Quero indicar 5 amigos" → tracking de indicações com recompensa

---

### 3. O "MODO INVESTIDOR" — PARA QUEM QUER PROFUNDIDADE

#### 3.1 Conceito

Nem todo cliente quer simplicidade. Alguns querem **dados reais de engenharia**.
Um toggle no topo:

```
[ 💼 Simplificado | 📊 Avançado ]
```

**Modo Simplificado** (default):

- Carteira de energia
- Economia vs sem solar
- Contas a pagar
- Score de saúde

**Modo Avançado** (para os curiosos):

- Geração por inversor individual
- Curva de geração diária (kW vs hora)
- Eficiência por string (se disponível)
- Comparativo com usinas similares
- Dados brutos de geração (CSV export)
- Correlação geração vs clima

#### 3.2 O "Terminal de Energia"

Para o modo avançado, um componente estilo terminal/monitor:

```
┌─────────────────────────────────────┐
│  SOLO TERMINAL v1.0                 │
│  ─────────────────────────────────  │
│  > Usina Principal                  │
│  ├─ Inversor 1: 2.4 kW ████████░ 80%│
│  ├─ Inversor 2: 1.8 kW ██████░░ 60%│
│  ├─ Tensão Rede: 127V ✓            │
│  ├─ Frequência: 60Hz ✓             │
│  └─ Temperatura: 42°C ⚠️           │
│                                      │
│  > Geração Hoje: 28.5 kWh           │
│  > Geração Mês: 842 kWh             │
│  > Meta Mês: 1.100 kWh ███████░░ 76%│
└─────────────────────────────────────┘
```

---

### 4. O ECOSSISTEMA DE INDICAÇÃO COMO MOTOR DE CRESCIMENTO

#### 4.1 A Mecânica

O cliente não indica porque pedimos. Ele indica porque:

1. **Se sente inteligente** — "fiz um ótimo negócio"
2. **Quer compartilhar** — o "Modo Apresentação" é a ferramenta
3. **Ganha algo** — Solo Coins, descontos, benefícios
4. **Vê resultado** — o amigo indicado também economiza

#### 4.2 O "Cartão de Visita Digital"

Cada cliente tem um link único de indicação que leva a uma **página pública**
com:

- Quanto o cliente economiza por mês
- Quanto já economizou no total
- Depoimento automático: "Eu economizo R$ 380/mês com Solo Energia"
- CTA: "Quero economizar também"

```typescript
// Página pública de indicação
solo.app/r/airton-silva
├── Hero: "Airton economiza R$ 380/mês"
├── Gráfico: economia mês a mês
├── Depoimento: gerado automaticamente
├── Selo: "Cliente Solo desde 2025"
└── CTA: "Simule sua economia"
```

#### 4.3 Níveis de Indicação (Gamificação)

| Nível    | Indicações | Benefício                               |
| -------- | ---------- | --------------------------------------- |
| Bronze   | 1-2        | 50 Solo Coins por indicação             |
| Prata    | 3-5        | 100 Solo Coins + selo "Indicador"       |
| Ouro     | 6-10       | 200 Solo Coins + 1 mês de taxa reduzida |
| Diamante | 11+        | 500 Solo Coins + benefício vitalício    |

---

### 5. O ADMIN COMO "CENTRO DE OPERAÇÕES"

#### 5.1 Visão do Admin (Solo Energia / Integrador)

O admin não é um dashboard genérico — é um **centro de operações**:

```
┌─────────────────────────────────────────────┐
│  SOLO OPERATIONS CENTER                      │
│                                              │
│  🔴 12 Alertas Críticos  🟡 8 Atenção       │
│  ─────────────────────────────────────────── │
│                                              │
│  CLIENTES │ USINAS │ TICKETS │ RELATÓRIOS    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐   │
│  │ 47   │ │ 89   │ │ 5    │ │ 12       │   │
│  │ ativos│ │ usinas│ │ abertos│ │ pendentes│   │
│  └──────┘ └──────┘ └──────┘ └──────────┘   │
│                                              │
│  ── ÚLTIMAS ATIVIDADES ──                    │
│  ✅ Cliente João ativou usina às 14:30       │
│  ⚠️ Usina Airton — Inversor 2 offline        │
│  📄 Fatura Maria — análise concluída         │
│  💰 Pagamento Carlos — R$ 238 confirmado     │
└─────────────────────────────────────────────┘
```

#### 5.2 O "Modo Suporte"

Quando um ticket é aberto, o admin vê **tudo sobre o cliente** em uma tela:

```
CLIENTE: Airton Silva
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Dados: Cliente desde 2025 | Plano: Premium
☀️ Usinas: 2 | Inversores: 4 | UCs: 7
💰 Status: Em dia | Último pagamento: 15/06
📊 Score: 92/100 | Geração mês: 1.240 kWh

🟢 Tudo operacional — Última falha: 12/04/2026

═══ TICKET #1024 ═══
"Meu inversor 2 está apagando desde ontem"
────────────────────────────────────────
📍 Usina Principal → Inversor 2 (Hoymiles)
📈 Geração atual: 0 kW (esperado: 1.2 kW)
⏰ Offline desde: 20/06 14:30
📋 Histórico: 3 falhas similares nos últimos 6 meses
🔧 Última manutenção: 10/03/2026

[Ações: 🔄 Testar conexão | 📞 Chamar técnico | 📝 Agendar visita]
```

#### 5.3 Relatórios Automáticos (como GDASH)

O admin configura uma vez e o sistema envia automaticamente:

- **Relatório mensal de geração** — para cada cliente
- **Relatório de economia** — comparativo mês a mês
- **Relatório de saúde do sistema** — alertas, falhas, uptime
- **Relatório de indicações** — tracking do programa Solo Coins

Canais: Email, WhatsApp, PDF exportável

---

### 6. A CAMADA DE AUTOMAÇÃO — O FUTURO SEM MANUAL

#### 6.1 O Pipeline de Automação

```
Manual (v1) → Semi-automático (v2) → Automático (v3)

v1: Cliente/Admin faz upload manual de faturas
v2: Sistema puxa da distribuidora, admin valida
v3: Sistema puxa, analisa, confirma automaticamente

v1: Admin aplica rateio manualmente
v2: Cliente propõe, admin aprova, sistema aplica
v3: Sistema otimiza e aplica rateio automaticamente

v1: Admin monitora alertas manualmente
v2: Sistema detecta e notifica admin
v3: Sistema detecta, diagnostica e agenda manutenção
```

#### 6.2 Integração com Distribuidoras

O grande diferencial será a **camada de integração com distribuidoras**:

```typescript
interface DistributorIntegration {
    // Pull automático de faturas
    fetchBill(
        clientNumber: string,
        installationNumber: string,
    ): Promise<EnergyBill>;

    // Status de débitos
    fetchDebts(clientNumber: string): Promise<Debt[]>;

    // Solicitação de religação (se aplicável)
    requestReconnection(clientNumber: string): Promise<void>;

    // Consulta de créditos de compensação
    fetchCredits(clientNumber: string): Promise<CreditSummary>;
}
```

Distribuidoras alvo: Enel, Cemig, Light, CPFL, Neoenergia, Equatorial, Energisa,
EDP

#### 6.3 O "Bot Enel" (Rateio Automático)

Um serviço que:

1. Recebe o rateio proposto pelo cliente
2. Valida as regras da Enel (limites, prazos)
3. Submete o rateio via portal da Enel (ou API)
4. Confirma a aplicação
5. Notifica o cliente

---

### 7. DESIGN DE INTERAÇÃO — MICRO-INTERAÇÕES

#### 7.1 Transições de Página

Em vez de páginas que "piscam" (carregamento → conteúdo), usar:

- **Slide horizontal** entre seções da sidebar
- **Fade + scale** para modais
- **Stagger** em listas (itens aparecem um após o outro)
- **Layout shift zero** — tudo tem tamanho definido antes de carregar

#### 7.2 Feedback Imediato

| Ação                 | Feedback                                 |
| -------------------- | ---------------------------------------- |
| Clicou "Copiar PIX"  | Check + "Copiado!" + haptic (mobile)     |
| Submeteu rateio      | Card "Pendente" aparece com animação     |
| Pagamento confirmado | Confetti sutil + badge "Pago"            |
| Alerta de inversor   | Card vermelho desliza + pulse no sidebar |
| Geração ao vivo      | Número incrementa suavemente             |

#### 7.3 O "Glow" como Linguagem Visual

```css
/* Glow verde — tudo ok, gerando */
.glow-green {
    box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
    animation: pulse-glow 2s ease-in-out infinite;
}

/* Glow laranja — atenção necessária */
.glow-orange {
    box-shadow: 0 0 20px rgba(245, 166, 35, 0.3);
}

/* Glow vermelho — ação necessária */
.glow-red {
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
    animation: pulse-glow 1s ease-in-out infinite;
}
```

---

### 8. O "MODO OFFLINE" — RESILIÊNCIA

#### 8.1 Conceito

O Brasil tem quedas de internet frequentes. O app precisa funcionar mesmo sem
conexão:

- **Cache de última geração conhecida** — o cliente sempre vê dados, mesmo que
  de ontem
- **Ações offline** — copiar PIX, ver fatura já carregada
- **Sync automático** — quando voltar a internet, sincroniza
- **Indicador de "dados de [data]"** — transparente sobre a frescura dos dados

#### 8.2 Estratégia Técnica

```typescript
// Service Worker caching strategy
const cacheStrategy = {
    // API data: stale-while-revalidate
    "/api/controle/*": "stale-while-revalidate",
    "/api/economia/*": "stale-while-revalidate",

    // Static assets: cache-first
    "/assets/*": "cache-first",

    // Real-time data: network-first with fallback
    "/api/generation/*": "network-first",

    // User actions: queue offline
    "POST /api/*": "offline-queue",
};
```

---

### 9. CONEXÕES ENTRE MÓDULOS — O ECOSSISTEMA

#### 9.1 Como Tudo se Conecta

```
ENERGIA (geração)
    │
    ▼
CONTAS (faturas) ←→ DISTRIBUIÇÃO (rateio)
    │                      │
    ▼                      ▼
PAGAMENTO (PIX)      CRÉDITOS (Enel)
    │
    ▼
CLUBE SOLO (Coins) ←→ INDICAÇÕES
    │
    ▼
OFERTAS / VOUCHERS
```

Cada módulo alimenta o próximo. O cliente nunca está "perdido" porque cada tela
tem um **próximo passo óbvio**.

#### 9.2 Exemplo de Fluxo Completo

```
1. ☀️ Cliente abre o app e vê a Carteira de Energia
2. ⚠️ Vê que tem uma conta pendente (Contas)
3. 💳 Abre a conta, vê a análise com IA, copia o PIX
4. ✅ Paga — o status muda automaticamente
5. 🏆 Ganha Solo Coins pelo pagamento em dia
6. 👥 Indica um amigo — ganha mais Coins
7. 🛍️ Usa os Coins para pagar a próxima conta
8. 🔄 O ciclo se repete — cliente engajado, satisfeito, fiel
```

---

### 10. REFLEXÕES FINAIS — O QUE AINDA PRECISAMOS RESPONDER

#### 10.1 Perguntas Técnicas

1. **WebSocket ou SSE para dados ao vivo?** SSE é mais simples, WebSocket é
   bidirecional
2. **PWA ou app nativo?** PWA para v1, nativo para v2
3. **Cache no frontend ou no backend?** Backend cache (Redis) + frontend cache
   (SW)
4. **Como escalar a análise de faturas?** Fila de processamento (BullMQ + Redis)
5. **Como lidar com 1000+ clientes simultâneos?** Load balancer + read replicas

#### 10.2 Perguntas de Produto

1. **Qual a primeira distribuidora a integrar?** Enel (maior base de clientes)
2. **O rateio automático é viável sem parceria Enel?** Precisa de pesquisa
3. **Solo Coins têm valor real (R$) ou só descontos?** Impacta contabilidade
4. **O cliente pode pagar a conta de luz com cartão de crédito?** Parceria com
   gateway
5. **Qual o plano gratuito vs pago?** Freemium para cliente final, SaaS para
   integrador

#### 10.3 Perguntas de Design

1. **Sidebar fixa ou collapsível?** Collapsível em desktop, bottom nav em mobile
2. **Gráficos interativos ou estáticos?** Interativos (zoom, hover, clique)
3. **Notificações push ou só in-app?** Push para críticos, in-app para
   informativos
4. **Tema claro?** Só dark mode por enquanto — claro é desvio de identidade
5. **Fontes locais ou Google Fonts?** Locais (Neue Montreal) + fallback DM Sans

---

### 11. PRÓXIMOS PASSOS — DESTA SESSÃO

| # | Ação                                                            | Prioridade |
| - | --------------------------------------------------------------- | ---------- |
| 1 | Validar o conceito de "Carteira de Energia" com um cliente real | Alta       |
| 2 | Definir o modelo de precificação (quem paga, quanto, como)      | Alta       |
| 3 | Pesquisar viabilidade técnica de integração com Enel            | Alta       |
| 4 | Criar protótipo do "Modo Apresentação" para indicação           | Média      |
| 5 | Implementar sistema de feature flags                            | Média      |
| 6 | Definir estratégia de cache e offline                           | Média      |
| 7 | Mapear distribuidoras brasileiras e suas APIs                   | Baixa      |
| 8 | Pesquisar PWA vs nativo para decisão informada                  | Baixa      |

---

_Sessão 2 concluída. O foco agora é sair do brainstorming e entrar em definição
— priorizar, validar com usuários reais, e transformar em tarefas de
desenvolvimento._
