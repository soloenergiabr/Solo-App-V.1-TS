import { NextRequest, NextResponse } from 'next/server';
import { clubService } from '@/backend/club/services';
import { withHandle } from '@/app/api/api-utils';
import { z } from 'zod';
import { OfferModel } from '@/backend/club/models/offer.model';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';

// Schemas
const CreateOfferSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    partner: z.string().min(1),
    cost: z.number().min(0),
    discount: z.string().optional(),
    imageUrl: z.string().optional(),
    validFrom: z.string().optional().transform(val => val ? new Date(val) : undefined),
    validTo: z.string().optional().transform(val => val ? new Date(val) : undefined),
    isActive: z.boolean().optional(),
    maxRedemptionsPerClient: z.number().optional(),
});

const UpdateOfferSchema = CreateOfferSchema.partial().extend({
    id: z.string().min(1),
});

const DeleteOfferSchema = z.object({
    id: z.string().min(1),
});

// Handlers
const createOffer = async (request: NextRequest): Promise<NextResponse> => {
    // Verify Master Access (Assuming AuthMiddleware handles basic auth, we might need role check here or in middleware)
    // For now, assuming the route protection is done via middleware or layout, but let's be safe
    const userContext = await AuthMiddleware.extractUserContext(request);
    // TODO: Verify if user is master/admin if not handled by middleware

    const body = await request.json();
    const validatedData = CreateOfferSchema.parse(body);

    const newOffer = new OfferModel({
        ...validatedData,
    });

    const createdOffer = await clubService.createOffer(newOffer);

    return NextResponse.json({
        success: true,
        data: createdOffer,
    });
};

const updateOffer = async (request: NextRequest): Promise<NextResponse> => {
    const body = await request.json();
    const validatedData = UpdateOfferSchema.parse(body);

    const existingOffer = await clubService.getOfferById(validatedData.id);
    if (!existingOffer) {
        return NextResponse.json({ success: false, message: 'Offer not found' }, { status: 404 });
    }

    const updatedOfferModel = new OfferModel({
        ...existingOffer,
        ...validatedData,
        updatedAt: new Date(),
    });

    console.log({
        validatedData
    })

    await clubService.updateOffer(updatedOfferModel);

    return NextResponse.json({
        success: true,
        message: 'Offer updated successfully',
    });
};

const deleteOffer = async (request: NextRequest): Promise<NextResponse> => {
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

// Dispatcher based on method is handled by Next.js App Router conventions (export POST, PUT, DELETE)

export const POST = withHandle(createOffer);
export const PUT = withHandle(updateOffer);
export const DELETE = withHandle(deleteOffer);
