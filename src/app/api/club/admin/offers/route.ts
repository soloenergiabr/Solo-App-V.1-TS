import { NextRequest, NextResponse } from 'next/server';
import { clubService } from '@/backend/club/services';
import { withHandle } from '@/app/api/api-utils';
import { z } from 'zod';
import { OfferModel } from '@/backend/club/models/offer.model';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import prisma from '@/lib/prisma';

// Datas do formulário chegam como "AAAA-MM-DD" (dia de Brasília): o início vale desde 00:00
// e o fim até 23:59:59 do dia escolhido. Vazio limpa a data; ausente mantém (update parcial).
const dateField = (endOfDay: boolean) => z.string().nullish().transform((val) => {
    if (val === undefined) return undefined;
    if (!val) return null;
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(val) ? `${val}T${endOfDay ? '23:59:59' : '00:00:00'}-03:00` : val);
    if (Number.isNaN(date.getTime())) throw new Error('Data inválida');
    return date;
});

const priceField = z.number().min(0, 'Preço não pode ser negativo').nullish();

const OfferSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    partner: z.string().min(1),
    cost: z.number().min(0),
    discount: z.string().optional(),
    imageUrl: z.string().optional(),
    externalUrl: z.string().trim().nullish().transform((val) => (val === undefined ? undefined : val || null)).refine(
        (val) => val == null || (/^https?:\/\//i.test(val) && URL.canParse(val)),
        'O link do produto deve começar com http:// ou https://',
    ),
    originalPrice: priceField,
    promoPrice: priceField,
    validFrom: dateField(false),
    validTo: dateField(true),
    isActive: z.boolean().optional(),
    maxRedemptionsPerClient: z.number().optional(),
});

const UpdateOfferSchema = OfferSchema.partial().extend({
    id: z.string().min(1),
});

function assertConsistent(offer: OfferModel) {
    if (offer.promoPrice != null && offer.originalPrice != null && offer.promoPrice > offer.originalPrice) {
        throw new Error('O preço promocional não pode ser maior que o preço normal.');
    }
    if (offer.validFrom && offer.validTo && offer.validFrom > offer.validTo) {
        throw new Error('A data de início da validade deve ser anterior à data de fim.');
    }
}

// Lista completa para o admin: inclui inativas, agendadas e expiradas.
const listOffers = async (request: NextRequest): Promise<NextResponse> => {
    await AuthMiddleware.requireRole(request, 'master');
    const offers = await prisma.offer.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: offers });
};

const createOffer = async (request: NextRequest): Promise<NextResponse> => {
    await AuthMiddleware.requireRole(request, 'master');

    const validatedData = OfferSchema.parse(await request.json());
    const newOffer = new OfferModel({ ...validatedData });
    assertConsistent(newOffer);

    const createdOffer = await clubService.createOffer(newOffer);

    return NextResponse.json({
        success: true,
        data: createdOffer,
    });
};

const updateOffer = async (request: NextRequest): Promise<NextResponse> => {
    await AuthMiddleware.requireRole(request, 'master');

    const validatedData = UpdateOfferSchema.parse(await request.json());

    const existingOffer = await clubService.getOfferById(validatedData.id);
    if (!existingOffer) {
        return NextResponse.json({ success: false, message: 'Oferta não encontrada' }, { status: 404 });
    }

    const updatedOfferModel = new OfferModel({
        ...existingOffer,
        ...validatedData,
        updatedAt: new Date(),
    });
    assertConsistent(updatedOfferModel);

    await clubService.updateOffer(updatedOfferModel);

    return NextResponse.json({
        success: true,
        message: 'Offer updated successfully',
    });
};

const deleteOffer = async (request: NextRequest): Promise<NextResponse> => {
    await AuthMiddleware.requireRole(request, 'master');

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ success: false, message: 'ID is required' }, { status: 400 });
    }

    await clubService.deleteOffer(id);

    return NextResponse.json({
        success: true,
        message: 'Offer deleted successfully',
    });
};

export const GET = withHandle(listOffers);
export const POST = withHandle(createOffer);
export const PUT = withHandle(updateOffer);
export const DELETE = withHandle(deleteOffer);
