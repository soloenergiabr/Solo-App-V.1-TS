import OpenAI from "openai";
import { FAQService } from "./faq.service";
import { PrismaFAQRepository } from "../repositories/implementations/prisma-faq.repository";
import { PrismaClient } from "@/app/generated/prisma";

export class AISupportService {
    private openai: OpenAI;
    private faqService: FAQService;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Criar o Prisma e passar para o repository
        const prisma = new PrismaClient();
        const faqRepository = new PrismaFAQRepository(prisma);
        this.faqService = new FAQService(faqRepository);
    }

    async askQuestion(userQuestion: string): Promise<string> {
        const faqs = await this.faqService.getActiveFAQs();

        const faqContext = faqs.map(faq =>
            `P: ${faq.question}\nR: ${faq.answer}`
        ).join("\n\n");

        const systemPrompt = `Você é o assistente virtual de suporte da Solo Energia.
        
Responda as perguntas dos clientes usando APENAS as informações do FAQ abaixo.
Se a pergunta não puder ser respondida com as informações disponíveis, 
diga educadamente que vai encaminhar para um atendente humano.

FAQ DA SOLO ENERGIA:
${faqContext}`;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userQuestion }
            ],
            temperature: 0.3,
        });

        return response.choices[0].message.content || "Desculpe, não consegui processar sua pergunta.";
    }
}