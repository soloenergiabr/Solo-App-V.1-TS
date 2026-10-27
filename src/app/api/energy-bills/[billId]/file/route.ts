import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { resolveAccessibleUnitIds } from '@/backend/controle/scope';
import { getS3Client } from '@/backend/storage/s3-client';

// Entrega o PDF da fatura pelo proprio app. O billFileUrl salvo aponta para o
// endpoint interno do MinIO (ex.: http://minio:9000), inacessivel pelo navegador.
const getBillFile = async (
    request: NextRequest,
    { params }: { params: Promise<{ billId: string }> },
) => {
    const userContext = await AuthMiddleware.requireAuth(request);
    const { billId } = await params;

    const bill = await prisma.energyBill.findUnique({
        where: { id: billId },
        select: { clientId: true, consumerUnitId: true, rawBillFileKey: true },
    });

    if (!bill?.rawBillFileKey) {
        return NextResponse.json({ success: false, message: 'Arquivo da fatura nao encontrado' }, { status: 404 });
    }

    if (!userContext.hasRole('master')) {
        // Mesmo escopo da tela de analise: titular pelo cliente, responsavel pela UC.
        const scope = await resolveAccessibleUnitIds(userContext.userId);
        const allowed = scope === 'all'
            ? bill.clientId === userContext.clientId
            : scope.includes(bill.consumerUnitId);
        if (!allowed) {
            return NextResponse.json({ success: false, message: 'Fatura nao encontrada' }, { status: 404 });
        }
    }

    const object = await getS3Client().send(new GetObjectCommand({
        Bucket: process.env.MINIO_BUCKET_NAME || 'uploads',
        Key: bill.rawBillFileKey,
    }));

    if (!object.Body) {
        return NextResponse.json({ success: false, message: 'Arquivo da fatura nao encontrado' }, { status: 404 });
    }

    return new NextResponse(object.Body.transformToWebStream(), {
        headers: {
            'Content-Type': object.ContentType || 'application/pdf',
            'Content-Disposition': 'inline',
            'Cache-Control': 'private, no-store',
        },
    });
};

export const GET = withHandle(getBillFile);
