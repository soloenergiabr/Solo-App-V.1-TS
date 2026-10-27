import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { uploadObject } from '@/lib/object-storage';
import { analyzeBillPdf, stringOrNull } from '@/backend/economia/bill-pdf-analysis';
import { eventBus, EventType } from '@/backend/shared/event-bus';

function cleanJsonText(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);
    return clean.trim();
}

const uploadClientBill = async (request: NextRequest) => {
    const userContext = await AuthMiddleware.requireAuth(request);

    if (!userContext.clientId) {
        return NextResponse.json(
            { success: false, message: 'Cliente nao identificado.' },
            { status: 403 },
        );
    }

    const clientId = userContext.clientId;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const consumerUnitId = stringOrNull(formData.get('consumerUnitId'));

    if (!file) {
        return NextResponse.json({ success: false, message: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    if (!consumerUnitId) {
        return NextResponse.json({ success: false, message: 'Selecione uma unidade consumidora.' }, { status: 400 });
    }

    const consumerUnit = await prisma.consumerUnit.findFirst({
        where: { id: consumerUnitId, clientId, deletedAt: null },
        include: { plant: true },
    });

    if (!consumerUnit) {
        return NextResponse.json({ success: false, message: 'Unidade consumidora nao encontrada.' }, { status: 404 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'application/pdf';

    // Upload PDF to object storage
    const fileKey = [
        'energy-bills',
        clientId,
        consumerUnitId,
        `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
    ].join('/');

    const uploaded = await uploadObject({
        key: fileKey,
        body: buffer,
        contentType: mimeType,
    });

    // Run analyzer
    const { referenceMonth, referenceYear, competenceDate, fields } = await analyzeBillPdf({
        buffer,
        mimeType,
        fallback: consumerUnit,
    });

    const billData = {
        clientId,
        plantId: consumerUnit.plantId,
        consumerUnitId,
        competenceDate,
        referenceMonth,
        referenceYear,
        billFileUrl: uploaded.url,
        rawBillFileKey: uploaded.key,
        rawBillFileSize: buffer.byteLength,
        ...fields,
        status: 'draft',
    };

    const bill = await prisma.energyBill.upsert({
        where: {
            consumerUnitId_referenceMonth_referenceYear: {
                consumerUnitId,
                referenceMonth,
                referenceYear,
            },
        },
        update: billData,
        create: billData,
    });

    // Emit upload event
    eventBus.emit(EventType.BILL_UPLOADED, {
        billId: bill.id,
        clientId,
        consumerUnitId,
    });

    return NextResponse.json({
        success: true,
        message: 'Fatura enviada com sucesso',
        data: { id: bill.id, status: bill.status },
    });
};

export const POST = withHandle(uploadClientBill);
