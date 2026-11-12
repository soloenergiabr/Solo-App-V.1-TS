# Manual do administrador — Solo App

Guia rápido para a equipe da Solo Energia operar o painel administrativo.

## 1. Primeiro acesso

1. Entre com o e-mail de administrador.
2. Vá em **Configurações › Minha conta** e troque a senha.
3. Em **Configurações › Equipe e permissões**, cadastre as outras pessoas da equipe. Use os modelos prontos ("Administrador completo", "Operação", "Somente leitura") ou marque as permissões uma a uma.

## 2. Dashboard

A primeira tela mostra:

- **O que precisa da sua atenção:** aprovações pendentes, faturas para validar, faturas vencidas, inversores sem geração há 48h e UCs com a senha da Enel recusada. Clique no item para resolver.
- **Indicadores:** clientes ativos, usinas, UCs com busca automática de faturas, consumo médio, faturas (pagas, a pagar, vencidas), economia gerada aos clientes e Clube Solo.
- **Exportar:** planilha (CSV) ou PDF dos indicadores.

## 3. Cadastrar e configurar um cliente

**Clientes › Novo cliente:** nome, e-mail, CPF/CNPJ e telefone. O telefone com DDD é usado no WhatsApp.

Na página do cliente, o quadro **Configuração do cliente** mostra os passos em ordem e o que falta. Clique em um passo para ir direto à aba certa:

1. **Usina** (aba *Usinas e UCs*): nome, potência e endereço.
2. **Unidades consumidoras (UCs):** uma por conta de luz. Informe o **número do cliente** que aparece na conta da Enel.
3. **Inversor** (opcional): escolha o fabricante (Solis, Solplanet, Deye, Hoymiles ou Auxsol) e o ID da usina no portal dele. Sem inversor, lance a geração do mês na aba *Geração*.
4. **Busca automática de faturas** (aba *Busca de faturas (Enel)*): clique em **Nova conexão** e informe o login da Enel do cliente. Depois marque quais UCs monitorar. A partir daí, as faturas chegam sozinhas todo mês, com PDF, PIX e análise por IA.
5. **Investimento** (aba *Resumo*): valor investido e data de início. Isso alimenta o payback que o cliente vê.
6. **Primeira fatura:** chega pela busca automática, ou use *Faturas › Importar PDF*.

Quando o próprio cliente cadastra a usina ou a UC pelo app, o cadastro aparece em **Pendências › Aprovações** para você aprovar ou recusar.

## 4. Faturas

- **Faturas** (na página do cliente): lista por UC. Mostra o PDF, permite marcar como paga ou revisada e lançar fatura à mão.
- **Pendências › Validação de faturas:** faturas e gerações enviadas pelos clientes, para aprovar ou rejeitar.
- **Integrações › Busca de faturas (Faturapi):** saldo da Faturapi, UCs monitoradas, conexões, extrações e eventos. Use **Reprocessar** num evento com falha.
  > Mantenha saldo na Faturapi. Sem saldo, as buscas falham com "saldo insuficiente".

## 5. Cobranças de Geração Distribuída (rateio)

Aba **Cobranças (GD)** do cliente:

1. Em *Unidades e responsáveis*, defina **quem paga** cada UC e a **regra de cobrança**: valor da fatura, valor por kWh ou valor fixo.
2. **Convidar:** o responsável recebe um e-mail para criar o acesso dele.
3. **Gerar cobranças do mês**, depois **Enviar** (e-mail ao responsável).
4. Com o pagamento online ligado (Stripe), o responsável paga com cartão ou PIX pelo app e a cobrança é marcada como paga sozinha. Sem ele, registre o recebimento manualmente.

## 6. Clube Solo

- **Ofertas do clube:** título, descrição, parceiro, custo em Solo Coins, **link do produto**, **preço normal e promocional** e **período da promoção** (início e fim). Ofertas fora do período somem para o cliente.
- **Indicações:** quem indicou quem, status e Solo Coins pagos. Aprove (informando o valor do projeto) ou rejeite. A aba **Ranking de engajamento** mostra os clientes mais ativos.
- **Regras do clube:** o percentual do valor do projeto pago em Solo Coins por indicação convertida (padrão 5%) e o texto que explica os Solo Coins ao cliente.
- **Lançar Solo Coins** (na página do cliente): crédito ou débito manual.

## 7. Notificações automáticas

O sistema avisa o cliente por e-mail, WhatsApp (quando configurado) e dentro do app (ícone de sino):

- nova fatura disponível;
- lembrete de vencimento (3 dias antes e no dia);
- pagamento confirmado;
- marcos de economia (R$ 500, R$ 1.000, R$ 2.500…);
- falta de geração (inversor sem dados há 48h) e senha da Enel recusada.

Os alertas críticos também vão para os e-mails em `ADMIN_ALERT_EMAIL`.

## 8. Suporte

- **FAQ:** cadastre perguntas e respostas. O cliente busca por palavra-chave na tela de Suporte.
- O cliente tem um **botão de ajuda** em todas as telas, com WhatsApp da equipe, FAQ e chat com IA.

## 9. Backup

O servidor faz backup diário do banco e dos PDFs na pasta `backups/` (14 dias por padrão). Copie essa pasta para um armazenamento externo. Para restaurar, veja o comentário em `scripts/backup.sh`.
