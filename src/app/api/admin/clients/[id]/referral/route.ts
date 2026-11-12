import { NextRequest, NextResponse } from 'next/server';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { listIndicationsForAdmin } from '@/backend/club/admin-indications';

// Indicações feitas por um cliente (ele como indicador).
const getClientReferrals = async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) => {
    await AuthMiddleware.requireRole(request, 'master');
    const { id } = await params;
    return NextResponse.json({ success: true, data: await listIndicationsForAdmin({ referrerId: id }) });
};

export const GET = withHandle(getClientReferrals);
