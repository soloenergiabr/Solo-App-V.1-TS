# Benchmarking Estratégico: GDASH → Solo App

> **Data:** 2026-06-20 **Propósito:** Análise completa do GDASH como benchmark
> para evolução do Solo App, incluindo visão de plataforma multi-tenant e
> diferenciação competitiva. **Contexto:** Solo Ventures como holding de
> produtos de software para o mercado de energia solar.

---

## Sumário

1. [Perfil do GDASH](#1-perfil-do-gdash)
2. [Análise Técnica e Funcional](#2-análise-técnica-e-funcional)
3. [O que Podemos Aprender com o GDASH](#3-o-que-podemos-aprender-com-o-gdash)
4. [Multi-tenant Agora ou Depois?](#4-multi-tenant-agora-ou-depois)
5. [Evolução UX/UI e Design System](#5-evolução-uxui-e-design-system)
6. [Evolução da Infraestrutura](#6-evolução-da-infraestrutura)
7. [Diferenciação Competitiva](#7-diferenciação-competitiva)
8. [Roadmap Estratégico — Fases para o Produto Final](#8-roadmap-estratégico)
9. [Visão Solo Ventures — A Plataforma Multi-tenant](#9-visão-solo-ventures)
10. [Princípios de Design e Arquitetura](#10-princípios-de-design-e-arquitetura)

---

## 1. Perfil do GDASH

### 1.1 Identificação

| Atributo           | Valor                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **Produto**        | GDASH — "App completo para gestão de faturas e central de monitoramento"                   |
| **URL**            | https://app.gdash.io                                                                       |
| **Fundador/Dev**   | Felipe Freire (gdash.felipefreire.workers.dev)                                             |
| **Segmento**       | Solar energy management (B2B — integradores solares)                                       |
| **Modelo**         | SaaS por assinatura (planos por funcionalidades)                                           |
| **Mobile**         | iOS (App Store) e Android (Google Play) — app ID: solar.gdash.mobile                       |
| **App Store**      | Desde 2022 (app-id: 1639015838)                                                            |
| **Redes**          | Instagram (@gdash.io), LinkedIn, YouTube (~541 inscritos)                                  |
| **Posicionamento** | "CRM e Gestão de Créditos de Energia" — ferramenta para integradores gerenciarem pós-venda |

### 1.2 Público-Alvo

O GDASH é **B2B puro**: sua plataforma é vendida para **integradores solares**
(empresas que instalam e mantêm usinas fotovoltaicas para seus clientes finais).
O integrador usa o GDASH para:

- Monitorar usinas de múltiplos clientes em um só lugar
- Auditar faturas de energia das distribuidoras
- Enviar relatórios automáticos para os clientes finais
- Gerenciar chamados de O&M (Operação e Manutenção)
- Gerenciar pipeline de vendas (CRM)

O cliente final do integrador **não tem acesso direto** ao GDASH — ele recebe
relatórios enviados pelo integrador.

### 1.3 Stack Tecnológica (Identificada)

| Camada               | Tecnologia                                                  |
| -------------------- | ----------------------------------------------------------- |
| **Framework**        | React + Vite (SPA com roteamento client-side)               |
| **Estilo**           | Tailwind CSS, dark mode nativo                              |
| **UI Componentes**   | Headless UI (Radix), Sonner (toasts)                        |
| **Ícones**           | Lucide React                                                |
| **Charts**           | Recharts (Pie, Bar, Area, Composed)                         |
| **Mapas**            | Google Maps API                                             |
| **Editor Rich Text** | TipTap/ProseMirror                                          |
| **Formulários**      | react-hook-form                                             |
| **Data Table**       | Data tables com paginação                                   |
| **Analytics**        | PostHog (self-hosted em gd.gdash.solar) + session recording |
| **CRM/Email**        | Customer.io, Gmail API, Outlook API                         |
| **Chat**             | Crisp Chat                                                  |
| **Build**            | Vite                                                        |
| **CDN/Deploy**       | Cloudflare Workers (gdash.felipefreire.workers.dev)         |
| **API Base**         | api.gdash.io                                                |
| **Tracking**         | Google Tag Manager, Facebook Pixel, Google Ads              |

Observação: A stack do GDASH é **mais simples** que a do Solo App. É uma SPA
React, sem SSR, sem App Router, sem separação backend/frontend monolítica. Isso
tem implicações de performance, SEO e arquitetura.

### 1.4 Funcionalidades Mapeadas (via análise do bundle JS + web)

O GDASH oferece os seguintes módulos, identificados pelos nomes dos chunks JS e
conteúdo das páginas:

#### Monitoramento e Geração

| Funcionalidade                  | Descrição                                              |
| ------------------------------- | ------------------------------------------------------ |
| **Dashboard Principal**         | Visão geral com métricas agregadas de todo o portfólio |
| **Dashboard Customizável**      | Perfis de dashboard personalizáveis por usuário        |
| **Monitoramento em Tempo Real** | Geração ao vivo dos inversores                         |
| **Mapa de Usinas**              | Visualização geográfica via Google Maps                |
| **Status de Usinas**            | Indicadores verde/amarelo/vermelho por planta          |
| **Pesquisa de Usinas**          | Busca e filtro no portfólio                            |
| **Instalações**                 | Registro de instalações por planta                     |
| **Ativação de Plantas**         | Fluxo de ativação com confirmação                      |

#### Faturas e Economia

| Funcionalidade                    | Descrição                                                 |
| --------------------------------- | --------------------------------------------------------- |
| **Auditoria de Faturas**          | Integração com concessionárias brasileiras para auditoria |
| **Status de Faturas**             | Acompanhamento do ciclo de vida das contas                |
| **Gestão de Créditos de Energia** | Acompanhamento de créditos de compensação                 |

#### CRM e Vendas

| Funcionalidade       | Descrição                               |
| -------------------- | --------------------------------------- |
| **CRM de Vendas**    | Pipeline de leads e oportunidades       |
| **Motivos de Perda** | Análise de motivos de negócios perdidos |
| **Tipos de Ticket**  | Categorização de chamados               |

#### O&M (Operação e Manutenção)

| Funcionalidade             | Descrição                                   |
| -------------------------- | ------------------------------------------- |
| **Gestão de Chamados**     | Abertura e acompanhamento de tickets de O&M |
| **Central de Atendimento** | Inbox para gestão de solicitações           |

#### Comunicação e Relatórios

| Funcionalidade               | Descrição                                      |
| ---------------------------- | ---------------------------------------------- |
| **Relatórios Automáticos**   | Envio mensal automatizado para clientes finais |
| **Template de E-mails**      | Editor de templates com TipTap/ProseMirror     |
| **Integração WhatsApp**      | Configuração de templates e envio              |
| **Integração Gmail/Outlook** | Autenticação e envio por APIs oficiais         |
| **Portal do Cliente**        | Acesso do cliente final a dados da usina       |

#### Configuração e Administração

| Funcionalidade                    | Descrição                                   |
| --------------------------------- | ------------------------------------------- |
| **Preferências da Organização**   | Configuração da empresa integradora         |
| **Widget de Configuração**        | Customização da interface para cada cliente |
| **Onboarding de Funcionalidades** | Tour guiado por novas features              |
| **Perfil do Integrador**          | Configuração de perfil profissional         |
| **Planos e Restrições**           | Gating de funcionalidades por plano         |

#### Sustentabilidade e Impacto (Módulo específico identificado)

| Funcionalidade                    | Descrição                                       |
| --------------------------------- | ----------------------------------------------- |
| **Portfólio de Sustentabilidade** | Dashboard de impacto ambiental                  |
| **CO₂ Evitado**                   | Cálculo de emissões evitadas                    |
| **Equivalência em Dólares**       | Economia em moeda                               |
| **Equivalência em Carros**        | Comparação com veículos retirados de circulação |

### 1.5 Modelo de Negócio

O GDASH opera como **SaaS por assinatura** com planos progressivos. Embora os
preços exatos não tenham sido extraídos, a estrutura identificada (via vídeo de
planos) sugere:

- **Planos por funcionalidades**: recursos bloqueados por nível de plano
  (componente `plan-not-allowed.component`)
- **Trial gratuito**: oferta de teste antes da contratação
- **Foco em SMB**: pequenos e médios integradores solares

---

## 2. Análise Técnica e Funcional

### 2.1 Comparação Direta: Solo App vs GDASH

| Dimensão                   | GDASH                                      | Solo App                                 | Vantagem                                |
| -------------------------- | ------------------------------------------ | ---------------------------------------- | --------------------------------------- |
| **Framework**              | React SPA (Vite)                           | Next.js 15 (SSR/App Router)              | **Solo** — SSR, SEO, performance        |
| **Arquitetura**            | Monolítica client-side                     | Domain-driven + Clean layers             | **Solo** — escalável, testável          |
| **Mobile**                 | Apps nativos (iOS/Android)                 | Web responsivo (PWA-ready)               | **GDASH** — experiência mobile dedicada |
| **IA**                     | Não identificada                           | Gemini AI para análise de faturas        | **Solo** — diferencial forte            |
| **Integração Inversores**  | Agregação de portais                       | APIs reais (Solis, Hoymiles, Deye, etc.) | **Solo** — dados em tempo real          |
| **CRM Vendas**             | Sim (pipeline, perda de leads)             | Não                                      | **GDASH**                               |
| **O&M Tickets**            | Sim (chamados, inbox)                      | Não                                      | **GDASH**                               |
| **Relatórios Automáticos** | Sim (email, whatsapp)                      | Parcial (só manual)                      | **GDASH**                               |
| **Portal do Cliente**      | Sim (limitado)                             | Sim (completo — todo o app)              | **Solo** — muito mais robusto           |
| **Multi-tenant**           | Por subdomínio (ex: solo-energia.gdash.io) | Não (tenant único)                       | **GDASH**                               |
| **Loyalty/Indicações**     | Não                                        | Solo Coins + Clube Solo                  | **Solo**                                |
| **Rateio/Créditos**        | Gestão de créditos (genérica)              | Rateio Enel com workflow completo        | **Solo**                                |
| **Análise de Faturas**     | Auditoria manual via concessionárias       | Análise IA + extração automática         | **Solo**                                |
| **Design System**          | Tailwind + Headless UI                     | Tailwind + shadcn/ui + Radix             | **Solo** — mais componentes             |
| **Testes**                 | Não identificado                           | 277 testes (Vitest)                      | **Solo**                                |
| **Criptografia**           | Não identificada                           | AES-256-GCM                              | **Solo**                                |
| **Mapa**                   | Google Maps                                | Não                                      | **GDASH**                               |
| **Custom Dashboard**       | Perfis customizáveis                       | Não                                      | **GDASH**                               |

### 2.2 Onde o GDASH é Superior

1. **Ecossistema completo para o integrador**: O GDASH resolve a vida da empresa
   integradora de ponta a ponta — monitoramento + fatura + CRM + O&M +
   relatórios. É um "ERP solar".

2. **Relatórios automáticos para clientes**: O integrador não precisa fazer nada
   — o sistema envia relatórios mensais por email/WhatsApp automaticamente. Isso
   reduz drasticamente o custo de operação.

3. **CRM de Vendas**: Pipeline completo desde o lead até o pós-venda. O Solo App
   não tem nada de CRM ainda.

4. **O&M Tickets**: Gestão de chamados de manutenção com inbox, categorização e
   fluxo de atendimento.

5. **Dashboard customizável**: Cada usuário pode montar seu próprio dashboard
   com os widgets que importam.

6. **Mobile nativo**: App iOS e Android dedicados (embora o app web responsivo
   do Solo seja funcional).

7. **Multi-tenant por subdomínio**: Cada cliente integrador tem seu subdomínio
   (ex: solo-energia.gdash.io).

8. **Onboarding de features**: Tour guiado quando novas funcionalidades são
   lançadas.

9. **Mapa geográfico de usinas**: Visualização espacial do portfólio.

10. **Gating por plano**: Funcionalidades bloqueadas por nível de assinatura
    (componente `plan-not-allowed`).

### 2.3 Onde o Solo App é Superior

1. **Arquitetura**: Next.js 15 com App Router + Domain-Driven Design é muito
   superior para escalar. O GDASH é uma SPA React que vai sentir dor crescendo.

2. **Análise com IA**: O uso do Gemini para extrair dados de PDFs de fatura e
   gerar explicações em linguagem natural é um diferencial absurdo. O GDASH faz
   auditoria manual via concessionárias.

3. **Integração real com inversores**: Enquanto o GDASH agrega portais, o Solo
   App se conecta diretamente às APIs dos fabricantes (Solis, Hoymiles, Deye,
   Auxsol, Solplanet) — dados em tempo real, não dependente de portal.

4. **Workflow de Rateio**: Completo, com status intended vs applied, validação
   Solo, timeline de auditoria. O GDASH tem gestão de créditos genérica.

5. **Loyalty/Indicações**: Solo Coins + Clube Solo + voucher system. O GDASH não
   tem nada parecido.

6. **Segurança**: Criptografia AES-256-GCM para credenciais, autenticação JWT
   com RBAC.

7. **Qualidade de código**: 277 testes, tipagem estrita, separação de concerns,
   domain events.

8. **Experiência do cliente final**: O Solo App é pensado para o cliente final
   usar diretamente — o GDASH é uma ferramenta interna do integrador.

---

## 3. O que Podemos Aprender com o GDASH

### 3.1 Lições de Produto

#### Lição 1: O Integrador Precisa de um "Centro de Comando"

O GDASH entende que o integrador solar precisa de **um lugar só** para gerenciar
todos os clientes. O Solo App hoje é focado no cliente final e no admin da Solo
Energia. **Falta a visão do integrador** (a empresa que instala e mantém).

**Aplicação no Solo App:**

- Criar uma visão "Integrador" (role `integrator`) entre `user` e `master`
- O integrador vê todos os seus clientes em um dashboard
- Pode emitir relatórios, abrir chamados, acompanhar métricas
- A Solo Energia seria a "master" que gerencia os integradores

#### Lição 2: Relatórios Automáticos São o "Killer Feature" do Pós-Venda

O recurso mais valioso do GDASH para o integrador é: **"configure uma vez, e
todo mês o relatório chega no cliente automaticamente"**. Isso reduz o custo de
operação e aumenta a satisfação do cliente.

**Aplicação no Solo App:**

- Implementar scheduler de relatórios mensais (via cron + event bus)
- Templates customizáveis de relatórios (geração, economia, economia de CO₂)
- Envio automático por email e WhatsApp
- Histórico de relatórios enviados

#### Lição 3: O&M Tickets São Essenciais

Se uma usina para de gerar, o cliente precisa de um canal para abrir chamado. O
GDASH tem um sistema de tickets com categorização, atribuição e acompanhamento.

**Aplicação no Solo App:**

- Criar módulo de suporte com tickets (não apenas chat)
- Categorias: falha de inversor, limpeza necessária, problemas elétricos
- Atribuição automática baseada em disponibilidade
- Integração com WhatsApp para atualizações

#### Lição 4: Dashboard Customizável Retém Usuários

O GDASH permite que cada usuário monte seu próprio dashboard. Isso parece
trivial mas é um grande diferencial de UX.

**Aplicação no Solo App:**

- Adicionar perfis de dashboard salvos por usuário
- Widgets selecionáveis (geração, economia, alertas, score)
- Layout drag-and-drop ou grid configurável

#### Lição 5: Onboarding de Features Reduz Churn

O GDASH tem um sistema de "feature onboarding cards" que aparecem quando novas
funcionalidades são lançadas.

**Aplicação no Solo App:**

- Implementar sistema de "feature discovery" (tooltips, modais de novidades)
- Tour guiado para novos usuários
- Checklist de primeiros passos ("conecte seu inversor", "veja sua primeira
  análise")

### 3.2 Lições de UX/UI

#### Lição 6: Dark Mode Como Padrão (Já Temos)

O GDASH usa dark mode como padrão (`class="h-full dark"`). O Solo App já faz
isso. ✅

#### Lição 7: Navegação por Sidebar com Seções Hierárquicas

O GDASH usa sidebar com seções bem definidas. O Solo App já tem sidebar com
role-based navigation. ✅

#### Lição 8: Mapa Como Ferramenta de Gestão Visual

O GDASH usa Google Maps para mostrar usinas no mapa. Isso dá uma visão
geográfica instantânea.

**Aplicação no Solo App:**

- Adicionar camada de mapa no dashboard do admin/integrador
- Pin das usinas com status (verde/amarelo/vermelho)
- Clusters para portfólios grandes

#### Lição 9: Métricas de Sustentabilidade com Equivalências

O GDASH traduz métricas técnicas em impacto: CO₂ evitado, carros equivalentes,
árvores plantadas.

**Aplicação no Solo App:**

- Já temos CO₂ module! Expandir com equivalências visuais
- "Economia equivalente a X árvores plantadas"
- "Energia suficiente para abastecer X casas"
- Compartilhável em redes sociais (embed)

#### Lição 10: Feedback Loop com "Plan Not Allowed"

O GDASH tem um componente elegante que mostra "essa funcionalidade não está
disponível no seu plano" em vez de simplesmente esconder o recurso.

**Aplicação no Solo App:**

- Implementar gating de features por plano de assinatura
- Upgrade prompts contextuais
- Comparação de planos dentro do app

### 3.3 Lições de Negócio

#### Lição 11: Duas Faces da Mesma Plataforma

O GDASH vende para o integrador, que usa para servir o cliente final. O Solo App
hoje serve o cliente final e o admin. **Oportunidade:** adicionar a camada do
integrador.

#### Lição 12: Automatizar o Pós-Venda é o Diferencial

O maior valor não está no monitoramento (qualquer portal de inversor faz isso),
mas no **ecossistema de pós-venda**: relatórios, faturas, comunicação, tickets.

#### Lição 13: Mobile é Canal de Retenção

O GDASH tem app nativo. O mercado brasileiro é mobile-first. Um PWA bem feito ou
app nativo é essencial para adoção.

---

## 4. Multi-tenant Agora ou Depois?

### 4.1 O Cenário Atual

Hoje o Solo App é **tenant único**: a Solo Energia opera o sistema para seus
clientes finais. A arquitetura tem:

- Roles: `user` (cliente final), `master` (admin Solo Energia)
- Clientes linked à Solo Energia via `Client` model
- Dados isolados por escopo de cliente via middleware

### 4.2 O Cenário Multi-tenant com Solo Ventures

```
Solo Ventures (holding)
│
├── Solo Energia (operação própria)
│   ├── Clientes finais da Solo Energia
│   └── Admin da Solo Energia
│
├── Integrador X (tenant white-label)
│   ├── Clientes finais do Integrador X
│   └── Admin do Integrador X
│
├── Integrador Y (tenant white-label)
│   ├── Clientes finais do Integrador Y
│   └── Admin do Integrador Y
│
└── Futuro: outras empresas de energia
```

### 4.3 Análise: Fazer Agora ou Depois?

| Fator                   | Fazer Agora                                         | Fazer Depois                              |
| ----------------------- | --------------------------------------------------- | ----------------------------------------- |
| **Esforço**             | Alto — refatorar schema, auth, middleware, isolates | Baixo — adicionar quando necessário       |
| **Risco**               | Alto — pode quebrar fluxos existentes               | Baixo — sem impacto                       |
| **Valor imediato**      | Baixo — Solo Energia é o único cliente              | N/A                                       |
| **Custo de mudança**    | Menor agora (menos dados, menos código)             | Maior depois (mais código, mais clientes) |
| **Alinhamento produto** | Desalinhado — v1 não é multi-tenant                 | Alinhado — v1 é Solo Energia              |

### 4.4 Recomendação: Fazer DEPOIS, mas Preparar Agora

**Estratégia:** "Prepare the soil, plant later."

**O que fazer AGORA (preparação sem risco):**

1. **Não misturar dados de locatário no schema principal** — manter o `Client`
   como dono dos dados
2. **Já temos isolamento por escopo** — o middleware de autorização já verifica
   `clientId`
3. **Adicionar `tenantId` como campo opcional** nas tabelas principais
   (nullable, sem FK rígida)
4. **Criar um `TenantConfig` model** vazio (pode ficar sem uso por enquanto)
5. **Extrair configurações de tenant para tabela** — branding, domínio, plano
6. **Documentar a estratégia** — saber onde e como o multi-tenant vai se
   conectar

```prisma
// Preparação futura (adicionar quando fizer sentido)
model Tenant {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  domain      String?  @unique
  plan        String   @default("starter")
  settings    Json?    // branding, email config, etc.
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  clients     Client[]
}
```

**O que NÃO fazer agora:**

- ⛔ Não refatorar todas as queries para incluir `tenantId`
- ⛔ Não criar middleware de tenant
- ⛔ Não mudar a arquitetura de autenticação
- ⛔ Não criar rotas por subdomínio
- ⛔ Não adicionar complexidade que não será usada

**O que fazer DEPOIS (gatilho: segundo cliente):**

- Quando um segundo integrador ou empresa quiser usar a plataforma
- Aí sim: refatorar para multi-tenant com isolamento real
- Subdomínios: `integradorx.solo.app`, `integradory.solo.app`
- White-label: cada um com sua marca

### 4.5 Conclusão

> **Foque em finalizar o produto para Solo Energia primeiro.** A multi-tenant é
> uma alavanca de escala, não de validação. Valide o produto com um cliente
> (Solo Energia), prove o valor, e depois multiplique.

---

## 5. Evolução UX/UI e Design System

### 5.1 Estado Atual do Design System

O Solo App já tem um design system robusto:

- Dark mode first
- Paleta com `#ff481e` (orange-red) + gradientes
- 40+ componentes shadcn/ui
- Fonte DM Sans + Neue Montreal
- Sistema de tokens CSS (`--brand-gradient`, `--glow-primary`, etc.)
- Animações com Framer Motion

### 5.2 Onde Evitar

| Área                 | Problema Atual                                                                | Oportunidade                                             |
| -------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Consistência**     | Alguns componentes usam `<span>` onde deveria ser `<Badge>` (M1 do PM review) | Auditoria de componentes para usar design system         |
| **Micro-interações** | Poucas animações de feedback                                                  | Adicionar transições suaves em hover, foco, estado vazio |
| **Loading states**   | Skeletons básicos                                                             | Melhorar com shimmer, transições de entrada              |
| **Empty states**     | Telas vazias sem orientação                                                   | Ilustrações + call-to-action + onboarding                |
| **Data tables**      | Paginação básica                                                              | Adicionar filtros, ordenação, exportação                 |
| **Formulários**      | Alguns sem validação visual                                                   | Melhorar feedback inline, auto-save                      |

### 5.3 Propostas de Evolução

#### 5.3.1 Sistema de Glow e Energia

O tema "energia" pede elementos visuais que transmitam **vitalidade, potência,
movimento**:

```css
/* Já existe -- ampliar */
--glow-energy: 0 0 24px rgba(74, 222, 128, 0.3);
--glow-primary: 0 0 30px rgba(255, 72, 30, 0.25);

/* Novo: glow pulsante para "ao vivo" */
@keyframes pulse-glow {
    0%, 100% {
        box-shadow: 0 0 14px rgba(74, 222, 128, 0.35);
    }
    50% {
        box-shadow: 0 0 28px rgba(74, 222, 128, 0.6);
    }
}
```

**Aplicações:**

- Indicador "Ao Vivo" pulsante na geração em tempo real
- Score ring com brilho proporcional à nota
- Cards de economia com leve glow verde
- Transições entre estados com fade+slide suaves

#### 5.3.2 Navegação Fluida

O GDASH usa sidebar fixa. O Solo App já tem sidebar. Melhorias:

- **Transições de página com Framer Motion** (já temos a lib) —
  `AnimatePresence` nas rotas
- **Breadcrumbs contextuais** — "Economia > Fatura > Março/2026 > Análise"
- **Progresso de wizard** — já existe no Minhas Usinas, mas pode ser mais visual
- **Navegação mobile** — bottom nav já existe, mas pode ter gestos

#### 5.3.3 Data Visualization Avançada

O Solo App já tem gráficos (Recharts), mas pode evoluir:

- **Score Ring animado** — o bill-score-ring já existe, pode ter animação de
  preenchimento
- **Comparação mês a mês** — barras lado a lado com delta percentual
- **Sparklines** — mini gráficos inline em tabelas
- **Heatmap de geração** — por hora do dia vs mês (identificar padrões)

#### 5.3.4 Mobile Experience

O mercado solar brasileiro é mobile-first. Priorizar:

- **PWA completo** — manifest, service worker, offline mode
- **Push notifications** — "sua conta chegou", "geração abaixo do esperado"
- **Bottom sheet** em vez de modal em mobile
- **Gestos** — swipe para ações rápidas
- **Compartilhamento nativo** — relatórios, economia, indicação

#### 5.3.5 Design System 2.0

Evoluir o design system atual:

```
Fase 1 (agora): Consistência
- Auditoria de componentes (caçar <span> soltos, any types)
- Português correto (acentos)
- Estados: loading, empty, error, success

Fase 2 (próximo): Personalidade
- Ilustrações customizadas (não só ícones)
- Tipografia mais expressiva (títulos com gradiente)
- Glow effects consistentes
- Micro-animações em todo lugar

Fase 3 (visão): Sistema vivo
- Temas dinâmicos (claro/escuro com transição suave)
- Modo "integrador" vs "cliente final" com paletas diferentes
- Componentes com variantes de tamanho/tom
- Design tokens consumíveis por CSS-in-JS
```

### 5.4 Inspirações de Design

| Referência             | O que absorver                                           |
| ---------------------- | -------------------------------------------------------- |
| **GDASH**              | Dashboard customizável, onboard cards, plan-not-allowed  |
| **Nubank**             | Dark mode, tipografia, micro-animações, estados vazios   |
| **Tesla App**          | Dados ao vivo, visual limpo, senso de premium            |
| **Huawei FusionSolar** | Dados técnicos apresentados de forma visual              |
| **Notion**             | Onboarding progressivo, blocos, templates                |
| **Linear**             | Design system consistente, dark mode refinado, shortcuts |
| **Stripe**             | Dashboard de métricas, transparência de dados            |

---

## 6. Evolução da Infraestrutura

### 6.1 Estado Atual

| Camada               | Status                                |
| -------------------- | ------------------------------------- |
| **Frontend**         | ✅ Next.js 15, Turbopack, SSR         |
| **Backend API**      | ✅ App Router API, withHandle pattern |
| **Database**         | ✅ PostgreSQL + Prisma ORM            |
| **Auth**             | ✅ JWT + bcrypt + RBAC                |
| **File Storage**     | ✅ S3/MinIO                           |
| **AI**               | ✅ Gemini API                         |
| **Event Bus**        | ✅ Domain events                      |
| **Tests**            | ✅ Vitest, 277 testes                 |
| **Docker**           | ✅ Dockerfile + docker-compose        |
| **CI/CD**            | ⚠️ Não identificado                   |
| **Monitoring**       | ⚠️ Não identificado                   |
| **Cache**            | ❌ Não identificado                   |
| **Background Jobs**  | ❌ Não identificado                   |
| **Feature Flags**    | ❌ Não identificado                   |
| **Mobile App**       | ❌ Web-only (PWA possível)            |
| **Documentação API** | ❌ Não identificado                   |

### 6.2 Próximos Passos na Infra

#### Prioridade 1 — Estabilidade e Observabilidade

```
- ✅ Logs estruturados (pino, winston, ou console)
- ❌ APM (Application Performance Monitoring)
- ❌ Error tracking (Sentry, Highlight)
- ❌ Health checks + status page
- ❌ Rate limiting
- ❌ Backup automático do banco
```

**Recomendação:**

- Adicionar **Sentry** para error tracking (gratuito para small scale)
- Adicionar **health endpoint** com status de dependências (DB, S3, Gemini)
- Configurar **backups automáticos** do PostgreSQL
- Adicionar **rate limiting** nas APIs públicas (upload de faturas)

#### Prioridade 2 — Performance

```
- ❌ Redis/Memória para cache
- ❌ CDN para assets estáticos
- ❌ ISR para páginas públicas
- ❌ Streaming de respostas longas (análise de fatura)
- ❌ Otimização de queries N+1
```

**Recomendação:**

- Adicionar **Redis** para cache de consultas frequentes (dashboard, geração)
- **Streaming** na análise de fatura (mostrar progresso enquanto Gemini
  processa)
- **Auditoria de queries** com Prisma — identificar N+1 nas listas de
  faturas/plantas

#### Prioridade 3 — Automação e DevOps

```
- ❌ CI/CD pipeline (GitHub Actions)
- ❌ Staging environment
- ❌ Migrations automatizadas
- ❌ Tests em CI
- ❌ Deploy automatizado
```

**Recomendação:**

- GitHub Actions com: lint → build → test → deploy
- Ambiente de staging (subdomínio `staging.solo.app`)
- Migrations aplicadas automaticamente no deploy (via `prisma migrate deploy`)

#### Prioridade 4 — Background Jobs

**Recomendação:**

- **Relatórios automáticos**: scheduler mensal (node-cron ou BullMQ)
- **Sincronia de geração**: job periódico para buscar dados dos inversores
- **Envio de notificações**: fila de emails/whatsapp
- **Processamento de faturas**: fila assíncrona para análise Gemini

---

## 7. Diferenciação Competitiva

### 7.1 Matriz de Diferenciação: Solo App vs Mercado

| Diferencial                   | GDASH              | SolarView          | Huawei FusionSolar | **Solo App**             |
| ----------------------------- | ------------------ | ------------------ | ------------------ | ------------------------ |
| **IA Explicativa**            | ❌                 | ❌                 | ❌                 | ✅ Gemini                |
| **Cliente Final usa o App**   | ❌ (só relatórios) | ❌                 | ❌                 | ✅ Experiência completa  |
| **Multi-inversor APIs reais** | ❌ (portais)       | ❌ (datalogger)    | ✅ (próprios)      | ✅ 5 fabricantes         |
| **Rateio Enel**               | Parcial            | ❌                 | ❌                 | ✅ Completo              |
| **Loyalty Program**           | ❌                 | ❌                 | ❌                 | ✅ Solo Coins            |
| **White-label ready**         | ✅                 | Parcial            | ❌                 | ✅ (quando multi-tenant) |
| **Open Architecture**         | ❌                 | ❌                 | ❌                 | ✅ Domain events         |
| **Admin + Client**            | ❌ (só integrador) | ❌ (só integrador) | ❌ (só dono)       | ✅ Ambos                 |

### 7.2 Os 5 Pilares de Diferenciação

#### Pilar 1: IA que Explica e Empodera

Enquanto os concorrentes mostram números, o Solo App **explica o que os números
significam**:

- "Sua conta de luz este mês foi R$ 350. Com seu sistema solar, você economizou
  R$ 180 (51%)."
- "Seu score de 82 está excelente, mas identificamos que a bandeira tarifária
  aumentou suas tarifas."
- "Sugerimos revisar o rateio: sua UC de maior consumo está com apenas 30% dos
  créditos."

**Essa é a vantagem mais difícil de copiar** — requer Gemini + modelo de dados
rico + domínio do negócio.

#### Pilar 2: Cliente Final no Centro

Diferente de GDASH e SolarView (ferramentas para o integrador), o Solo App dá ao
**cliente final**:

- Dashboard completo
- Análise detalhada de cada fatura
- Rateio com status claro
- Clube de benefícios
- Cópia PIX com um clique

**Isso gera engajamento, reduz chamados de suporte e fideliza.**

#### Pilar 3: Ecossistema Fechado com Incentivos

Solo Coins + Indicações + Clube Solo cria um **ecossistema de incentivos** que
nenhum concorrente tem:

- Cliente vira promotor (indica → ganha coins → paga menos)
- Gamificação do monitoramento
- Rede de referência orgânica

#### Pilar 4: Arquitetura Pronta para o Futuro

Enquanto os concorrentes são sistemas legados ou SPAs simples, o Solo App tem:

- Event-driven (event bus)
- Domain-driven design
- Test coverage (277 testes)
- API extensível
- Pronto para automação (n8n, Agno, bots)

#### Pilar 5: Visão Solo Ventures

A diferença final é que o Solo App não é só um produto — é uma **plataforma**:

```
Hoje:     Solo Energia → clientes finais
Amanhã:   Solo Ventures → empresas de energia → clientes finais
```

---

## 8. Roadmap Estratégico

### 8.1 Fase Atual — Finalizar MVP Solo Energia (Q3 2026)

**Objetivo:** Produto estável e completo para a Solo Energia operar seus
clientes.

| Tarefa                                 | Status                               | Prioridade |
| -------------------------------------- | ------------------------------------ | ---------- |
| ✅ Rateio UI polish (M1-M6)            | ⚠️ Feito na branch, revisão pendente | Alta       |
| ✅ Merge Sprint 3 → main               | ⚠️ Pendente                          | Alta       |
| ✅ Migrations aplicadas em produção    | ⚠️ Pendente                          | Crítica    |
| ✅ Inverter credential encryption (B1) | ⚠️ Feito, validar merge              | Alta       |
| ✅ Validation gate (C1)                | ⚠️ Feito, validar merge              | Alta       |
| ❌ Manual QA completo                  | Não feito                            | Alta       |
| ❌ Testes de permissão cross-client    | Não feito                            | Média      |
| ❌ Documentação de usuário             | Não feito                            | Média      |
| ❌ Onboarding para novos clientes      | Não feito                            | Média      |

### 8.2 Fase 1 — Refinamento e Consistência (Q3 2026)

**Objetivo:** Elevar a qualidade percebida e fechar gaps de UX.

| Iniciativa                                                  | Esforço | Impacto |
| ----------------------------------------------------------- | ------- | ------- |
| **Auditoria de componentes** — caçar inconsistências        | 3 dias  | Alto    |
| **Estados vazios** — ilustrações + CTAs em telas sem dados  | 5 dias  | Alto    |
| **Micro-animações** — Framer Motion em transições           | 5 dias  | Alto    |
| **Loading states melhores** — shimmer, skeleton avançado    | 3 dias  | Médio   |
| **Formulários** — validação inline, auto-save, erros claros | 5 dias  | Alto    |
| **Responsivo** — testar e ajustar todas as telas em mobile  | 5 dias  | Alto    |
| **Acentos e copy** — revisão de português em todo o app     | 2 dias  | Médio   |

### 8.3 Fase 2 — Módulos do Integrador (Q3-Q4 2026)

**Objetivo:** Adicionar a camada que falta — a visão do integrador/empresa.

| Iniciativa                                                         | Esforço | Impacto    |
| ------------------------------------------------------------------ | ------- | ---------- |
| **Role `integrator`** — novo nível entre user e master             | 5 dias  | Alto       |
| **Dashboard do integrador** — visão geral do portfólio de clientes | 8 dias  | Alto       |
| **O&M Tickets** — abertura, categorização, fluxo                   | 10 dias | Alto       |
| **Relatórios automáticos** — scheduler + templates + envio         | 10 dias | Muito Alto |
| **Mapa de usinas** — Google Maps com pins de status                | 5 dias  | Médio      |
| **Notificações** — push + email + whatsapp para eventos            | 8 dias  | Alto       |

### 8.4 Fase 3 — Plataforma Multi-tenant (Q4 2026 - Q1 2027)

**Objetivo:** Abrir a plataforma para outras empresas de energia.

| Iniciativa                                                    | Esforço | Risco |
| ------------------------------------------------------------- | ------- | ----- |
| **Modelo Tenant** — schema + configurações                    | 3 dias  | Baixo |
| **Isolamento por tenant** — middleware + queries              | 10 dias | Alto  |
| **White-label** — branding por tenant (logo, cores, domínio)  | 8 dias  | Médio |
| **Subdomínios** — *.solo.app routing                          | 5 dias  | Médio |
| **Planos e gating** — feature flags por plano                 | 8 dias  | Alto  |
| **Onboarding multi-tenant** — setup wizard para novos tenants | 8 dias  | Médio |

### 8.5 Fase 4 — CRM e Vendas (Q1 2027)

**Objetivo:** Pipeline completo de vendas para integradores.

| Iniciativa                                         | Esforço |
| -------------------------------------------------- | ------- |
| **Pipeline de leads** — kanban, estágios           | 8 dias  |
| **Propostas comerciais** — geração de propostas    | 10 dias |
| **Motivos de perda** — análise de churn            | 3 dias  |
| **Integração com WhatsApp** — templates, automação | 5 dias  |

### 8.6 Fase 5 — Mobile Nativo (Q1-Q2 2027)

**Objetivo:** App nativo iOS + Android.

| Iniciativa                                           | Esforço     |
| ---------------------------------------------------- | ----------- |
| **PWA completo** — manifest, service worker, offline | 5 dias      |
| **Push notifications** — Firebase/APNs               | 5 dias      |
| **React Native ou Expo** — app nativo compartilhado  | 3-4 semanas |
| **Biometria** — login com digital/face               | 2 dias      |

---

## 9. Visão Solo Ventures

### 9.1 A Arquitetura de Plataforma

```
SOLO VENTURES (holding de software)
│
├── Plataforma Core (Solo App Platform)
│   ├── Módulo de Auth (multi-tenant)
│   ├── Módulo de Monitoramento
│   ├── Módulo de Faturas/IA
│   ├── Módulo de Rateio
│   ├── Módulo de CRM/Vendas
│   ├── Módulo de O&M/Tickets
│   ├── Módulo de Relatórios
│   └── Módulo de Loyalty
│
├── Tenant: Solo Energia (cliente âncora)
│   ├── Admin: equipe Solo
│   └── Clientes finais da Solo
│
├── Tenant: Integradora Alpha (white-label)
│   ├── Admin: equipe Alpha
│   ├── Marca: cores/logo da Alpha
│   └── Clientes finais da Alpha
│
├── Tenant: Integradora Beta (white-label)
│   ├── Admin: equipe Beta
│   ├── Marca: cores/logo da Beta
│   └── Clientes finais da Beta
│
└── Futuro: Distribuidoras, cooperativas, geradores
```

### 9.2 Modelo de Receita

| Fluxo                   | Descrição                                                           |
| ----------------------- | ------------------------------------------------------------------- |
| **Assinatura SaaS**     | Mensalidade do tenant (integrador) baseada em número de clientes    |
| **Premium por cliente** | Funcionalidades avançadas por cliente final (IA, rateio automático) |
| **Marketplace**         | Comissão em ofertas do Clube Solo                                   |
| **Implementação**       | Taxa de setup para novos tenants                                    |
| **White-label**         | Taxa adicional para branding customizado                            |

### 9.3 A Meta

> **Tornar o Solo App o "ERP Solar" do Brasil** — a plataforma que toda empresa
> de energia solar usa para gerenciar seus clientes, e que todo cliente final
> usa para acompanhar sua geração.

Isso significa:

- **Para o integrador**: gestão completa (monitoramento + fatura + CRM + O&M +
  relatórios)
- **Para o cliente final**: app completo com IA, rateio, loyalty, PIX
- **Para a Solo Ventures**: receita recorrente, dados, escala

### 9.4 Diferenciação em Relação ao GDASH no Multi-tenant

| Dimensão          | GDASH                | Solo Platform                         |
| ----------------- | -------------------- | ------------------------------------- |
| **Público**       | Integradores solares | Empresas de energia + clientes finais |
| **IA**            | ❌                   | ✅ Gemini                             |
| **Cliente final** | Relatórios passivos  | App ativo completo                    |
| **Loyalty**       | ❌                   | ✅ Solo Coins                         |
| **Arquitetura**   | SPA simples          | Next.js 15 + DDD                      |
| **Integrações**   | Portais de inversor  | APIs reais                            |
| **Maturidade**    | 4+ anos no mercado   | 6 meses                               |

---

## 10. Princípios de Design e Arquitetura

### 10.1 Princípios de Produto

1. **Cliente propõe, Solo valida, automação executa** — o core contract do v1
2. **IA explica, não decide** — a IA da verdades financeiras, mas a decisão é do
   humano
3. **Transparência radical** — o cliente sempre vê o status real (pending vs
   applied, pending_review vs confirmed)
4. **Mobile first, web melhor** — toda funcionalidade deve funcionar em mobile
5. **Offline não quebra** — se não tem internet, o app mostra o último estado
   conhecido

### 10.2 Princípios Técnicos

1. **Event-driven** — tudo relevante vira evento no event bus
2. **Separação de concerns** — backend puro, frontend puro, shared types
3. **Repositórios sobre queries diretas** — acesso a dados encapsulado
4. **Testes em cada camada** — unitário, integração, contrato
5. **Configuração sobre código** — tenent config, feature flags, templates

### 10.3 Princípios de UX

1. **Cada tela tem um propósito** — sem páginas "curriculo"
2. **Estados importam** — loading, empty, error, success são tão importantes
   quanto o estado cheio
3. **Feedback imediato** — cada ação do usuário tem resposta visual
4. **Onboarding progressivo** — o app se revela conforme o usuário avança
5. **Dados são ativos** — gráficos e métricas são o centro da experiência

---

## Apêndice A: Fontes

- Análise do HTML do GDASH (app.gdash.io) — bundles JS, CSS, estrutura de
  páginas
- Google Play Store — GDASH Solar app description
- Site oficial GDASH (gdash.io) — descrições de funcionalidades
- Sharenergy — comparação GDASH vs SolarView
- YouTube GDASH — demonstrações de produtos e planos
- Apple App Store — GDASH Solar app description
- Análise completa do código do Solo App v1 (branch main + sprint3)

## Apêndice B: Glossário

| Termo                | Significado                                                   |
| -------------------- | ------------------------------------------------------------- |
| **Integrador Solar** | Empresa que projeta, vende, instala e mantém sistemas solares |
| **SPE**              | Sociedade de Propósito Específico (usinas de investimento)    |
| **UC**               | Unidade Consumidora (ponto de consumo de energia)             |
| **Rateio**           | Distribuição de créditos de energia entre UCs                 |
| **O&M**              | Operação e Manutenção                                         |
| **Tenant**           | Inquilino/Cliente da plataforma (em arquitetura multi-tenant) |
| **White-label**      | Produto vendido com a marca do cliente                        |
| **Pós-venda**        | Conjunto de serviços após a instalação do sistema solar       |
| **B2B**              | Venda para empresas (business-to-business)                    |
| **SC**               | Solo Coins (moeda de fidelidade)                              |
