import { NextRequest, NextResponse } from 'next/server';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withHandle } from '@/app/api/api-utils';

const importConsumption = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string | undefined }> }
) => {
    await AuthMiddleware.extractUserContext(request);

    // Allow for nested routes [clientId] or top level [id] depending on folder structure
    const { id: clientId } = await params;

    if (!clientId) {
        return NextResponse.json({ success: false, message: 'Client ID is missing' }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json(
            { success: false, message: 'Nenhum arquivo enviado.' },
            { status: 400 }
        );
    }

    // Convert File to ArrayBuffer to Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { success: false, message: 'Chave de API do Gemini não configurada no servidor.' },
            { status: 500 }
        );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Você é um especialista em extração de dados de faturas de energia elétrica, em especial da concessionária Enel.
Vou te enviar um PDF (ou imagens do PDF) de uma fatura de energia.
Sua tarefa é extrair os seguintes dados e retornar EXATAMENTE um JSON, sem blocos de markdown e sem nenhum outro texto:

{
  "competenceDate": "string",
  "consumptionKwh": numero,
  "injectedEnergyKwh": numero,
  "tariffPerKwh": numero,
  "totalBillValue": numero
}

Diretrizes detalhadas:
- "competenceDate": Encontre o Mês de Referência da fatura (ex: MAI/2023, 05/2023). Retorne SEMPRE como o primeiro dia do mês em formato ISO 8601 UTC. Exemplo: Se for fev/2024, retorne "2024-02-01T12:00:00.000Z".
- "consumptionKwh": O total de energia consumida da rede em kWh. Procure por "Energia Ativa", "Consumo Ativo", "Energia Elétrica kWh" ou similar.
- "injectedEnergyKwh": O total de energia injetada na rede em kWh, caso haja Geração Distribuída (Painéis Solares). Procure por "Energia Injetada", "Energia Ativa Injetada". Se não encontrar ou o cliente não tiver geração, retorne 0.
- "tariffPerKwh": A tarifa de energia por kWh. Procure pelo valor unitário da "Energia Ativa" com impostos (TE + TUSD se divididos, some e divida para obter o valor unitário total, ou o valor cobrado dividido pelo consumoKwh).
- "totalBillValue": O valor total a pagar da fatura em reais. Procure por "Total a pagar", "Valor a pagar", etc.

Retorne APENAS o JSON válido.
`;

    try {
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type || 'application/pdf',
                },
            },
        ]);

        const text = result.response.text();

        // Clean potential markdown blocks like ```json ... ```
        let cleanJson = text.trim();
        if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.substring(7);
            if (cleanJson.endsWith('```')) {
                cleanJson = cleanJson.substring(0, cleanJson.length - 3);
            }
        } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.substring(3);
            if (cleanJson.endsWith('```')) {
                cleanJson = cleanJson.substring(0, cleanJson.length - 3);
            }
        }

        const data = JSON.parse(cleanJson.trim());

        // Validation to prevent totally absurd values or fallback to defaults
        const consumptionKwh = Number(data.consumptionKwh) || 0;
        const injectedEnergyKwh = Number(data.injectedEnergyKwh) || 0;
        const tariffPerKwh = Number(data.tariffPerKwh) || 0;
        const totalBillValue = Number(data.totalBillValue) || 0;

        let startOfMonth: Date;
        try {
            startOfMonth = new Date(data.competenceDate);
            if (isNaN(startOfMonth.getTime())) {
                startOfMonth = new Date();
            }
            startOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 1);
        } catch {
            startOfMonth = new Date();
            startOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), 1);
        }

        // Upsert the consumption record
        const consumption = await prisma.consumption.upsert({
            where: {
                clientId_competenceDate: {
                    clientId,
                    competenceDate: startOfMonth,
                }
            },
            update: {
                consumptionKwh,
                injectedEnergyKwh,
                tariffPerKwh,
                totalBillValue,
            },
            create: {
                clientId,
                competenceDate: startOfMonth,
                consumptionKwh,
                injectedEnergyKwh,
                tariffPerKwh,
                totalBillValue,
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Fatura importada com sucesso',
            data: consumption
        });
    } catch (error: any) {
        console.error('Error parsing PDF with Gemini:', error);
        return NextResponse.json(
            { success: false, message: 'Falha ao analisar o arquivo PDF. Tente inserir manualmente.' },
            { status: 500 }
        );
    }
};

export const POST = withHandle(importConsumption);
