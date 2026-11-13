import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { AuthMiddleware } from '@/backend/auth/middleware/auth.middleware';
import { passwordSchema } from '@/shared/admin-users/permissions';

const schema = z.object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'A confirmação não confere com a nova senha' });

const changePassword = async (request: NextRequest) => {
    const { userId } = await AuthMiddleware.requireAuth(request);

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.issues[0]?.message ?? 'Dados inválidos' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true, isActive: true } });
    if (!user || !user.isActive || !(await bcrypt.compare(parsed.data.currentPassword, user.password))) {
        return NextResponse.json({ success: false, message: 'Senha atual incorreta.' }, { status: 400 });
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            password: await bcrypt.hash(parsed.data.newPassword, 10),
            resetPasswordToken: null,
            resetPasswordExpires: null,
        },
    });

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso.' });
};

export const POST = withHandle(changePassword);
