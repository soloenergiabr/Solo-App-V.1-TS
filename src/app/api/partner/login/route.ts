import { clubService } from "@/backend/club/services";
import { NextRequest, NextResponse } from "next/server";
import { withHandle } from "@/app/api/api-utils";

// POST - Partner login with PARTNER_PASSWORD
const partnerLoginRoute = async (request: NextRequest): Promise<NextResponse> => {
    const body = await request.json();
    const { password } = body;

    const partnerPassword = process.env.PARTNER_PASSWORD;

    if (!partnerPassword) {
        return NextResponse.json({
            success: false,
            message: 'Sistema de parceiros não configurado',
        }, { status: 500 });
    }

    if (password !== partnerPassword) {
        return NextResponse.json({
            success: false,
            message: 'Senha inválida',
        }, { status: 401 });
    }

    return NextResponse.json({
        success: true,
        message: 'Login realizado com sucesso',
    });
};

export const POST = withHandle(partnerLoginRoute);
