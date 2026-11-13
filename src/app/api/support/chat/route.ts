import { NextRequest, NextResponse } from "next/server";
import { AISupportService } from "@/backend/support/services/ai-support.service";
import { AuthMiddleware } from "@/backend/auth/middleware/auth.middleware";

export async function POST(request: NextRequest) {
    // Chat consome creditos da OpenAI: so para usuarios logados.
    try {
        await AuthMiddleware.requireAuth(request);
    } catch {
        return NextResponse.json({ error: "Faça login para usar o chat" }, { status: 401 });
    }
    try {

        const body = await request.json();
        const { question } = body;

        if (!question) {
            return NextResponse.json(
                { error: "Pergunta é obrigatória" },
                { status: 400 }
            );
        }

        const aiService = new AISupportService();
        const answer = await aiService.askQuestion(question);

        return NextResponse.json({ answer });

    } catch (error) {
        console.error("Erro no chat de suporte:", error);
        return NextResponse.json(
            { error: "Erro ao processar sua pergunta" },
            { status: 500 }
        );
    }
}