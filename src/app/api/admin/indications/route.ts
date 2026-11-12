import { NextRequest, NextResponse } from 'next/server';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { clubEngagementRanking, listIndicationsForAdmin } from '@/backend/club/admin-indications';

// shortcut: devolve todas as indicações e o filtro/busca é feito na tela; paginar se passar de alguns milhares.
const getIndications = async (request: NextRequest) => {
    await AuthMiddleware.requireRole(request, 'master');
    const [indications, ranking] = await Promise.all([listIndicationsForAdmin(), clubEngagementRanking()]);
    return NextResponse.json({ success: true, data: { indications, ranking } });
};

export const GET = withHandle(getIndications);
