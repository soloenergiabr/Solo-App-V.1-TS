// scripts/seed-faq.ts
import { PrismaClient } from "../src/app/generated/prisma";

const prisma = new PrismaClient();

// Seus dados de FAQ
const faqData = [
    {
        category: "Geração de Energia",npx tsx scripts/seed-faq.ts
        question: "Meu sistema parou de gerar energia. O que pode ter acontecido?",
        answer: "Verifique se o inversor está ligado e se há energia da concessionária. Caso o inversor esteja desligado, pode ter ocorrido uma queda de rede, disparo do disjuntor ou falha de comunicação. No app, acesse 'Suporte > Diagnóstico' para visualizar o status e solicitar ajuda técnica."
    },
    {
        category: "Monitoramento",
        question: "Por que minha geração está abaixo do esperado?",
        answer: "A geração pode variar por fatores climáticos, sombreamento, sujeira nos módulos ou perda de eficiência do inversor. O app analisa automaticamente essas variações e notifica quando identificar queda anormal de desempenho."
    },
    {
        category: "Comunicação",
        question: "O aplicativo não está mostrando os dados do inversor. O que devo fazer?",
        answer: "Isso pode indicar perda de conexão entre o inversor e o servidor. Confira se o Wi-Fi ou cabo de rede estão funcionando. Se o problema persistir, o app enviará um alerta automático e abrirá um chamado técnico."
    },
    {
        category: "Conta de Energia",
        question: "Por que ainda recebo uma conta de energia mesmo com o sistema solar?",
        answer: "A conta permanece porque você continua conectado à rede da concessionária. A fatura inclui taxas mínimas e o balanço entre a energia gerada e a consumida. O app mostra esses valores detalhados na aba 'Economia'."
    },
    {
        category: "Manutenção",
        question: "Com que frequência devo limpar os módulos solares?",
        answer: "Recomendamos limpeza a cada 6 meses, ou antes, se houver acúmulo visível de sujeira. O app envia lembretes automáticos e indica empresas parceiras de manutenção na sua região."
    },
    {
        category: "Notificações",
        question: "Recebi uma notificação dizendo que meu inversor está desligado. E agora?",
        answer: "Verifique o disjuntor e a energia da rede. Se estiver tudo normal, aguarde alguns minutos — o sistema pode reiniciar automaticamente. Caso persista, acione o suporte pelo próprio app."
    },
    {
        category: "App e Login",
        question: "Esqueci minha senha do Solo App. Como posso recuperar?",
        answer: "Na tela de login, clique em 'Esqueci minha senha'. Você receberá um e-mail com o link para redefinição. Caso não receba, verifique a caixa de spam ou entre em contato pelo suporte."
    },
    {
        category: "Financeiro",
        question: "Posso acompanhar o retorno financeiro do meu sistema?",
        answer: "Sim. O painel 'Economia' mostra quanto você já economizou e estima o payback do sistema com base nos dados de geração e tarifa atual da concessionária."
    },
    {
        category: "Clube Solo",
        question: "O que é o Clube Solo?",
        answer: "O Clube Solo é um programa de benefícios para clientes Solo Energia. Ao indicar amigos, você ganha SCoins, que podem ser trocados por serviços, upgrades ou descontos em manutenção e produtos parceiros."
    },
    {
        category: "Suporte Técnico",
        question: "Como posso abrir um chamado técnico?",
        answer: "Acesse o app, vá em 'Suporte > Novo Chamado', descreva o problema e envie uma foto, se possível. O sistema gera automaticamente um ticket e nossa equipe acompanha até a resolução."
    }
];

async function main() {
    console.log("🌱 Iniciando seed de FAQs...");

    for (const faq of faqData) {
        await prisma.fAQ.create({
            data: {
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                isActive: true,
            },
        });
        console.log(`✅ Criado: ${faq.question.substring(0, 50)}...`);
    }

    console.log("🎉 Seed concluído! FAQs inseridas com sucesso.");
}

main()
    .catch((e) => {
        console.error("❌ Erro no seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });