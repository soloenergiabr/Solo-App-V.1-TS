import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { withHandle } from '@/app/api/api-utils';
import { adminChangeError } from '@/backend/auth/admin-users.rules';
import { PrismaUserRepository } from '@/backend/auth/repositories/prisma-user.repository';
import { ForgotPasswordUseCase } from '@/backend/auth/use-cases/forgot-password.use-case';
import { ALL_PERMISSIONS, passwordSchema, type Permission } from '@/shared/admin-users/permissions';
import { ADMIN_USER_SELECT, badRequest, requireTeamManager } from './team-manager';

const createSchema = z.object({
    name: z.string().trim().min(2, 'Informe o nome'),
    email: z.string().trim().toLowerCase().email('E-mail inválido'),
    // Sem senha: enviamos o e-mail de redefinição de senha (fluxo "esqueci a senha").
    password: passwordSchema.optional(),
    permissions: z.array(z.enum(ALL_PERMISSIONS as [Permission, ...Permission[]])),
});

const listUsers = async (request: NextRequest) => {
    const { denied } = await requireTeamManager(request);
    if (denied) return denied;

    const users = await prisma.user.findMany({
        where: { roles: { has: 'master' } },
        select: ADMIN_USER_SELECT,
        orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: users });
};

const createUser = async (request: NextRequest) => {
    const { actor, denied } = await requireTeamManager(request);
    if (denied) return denied;

    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Dados inválidos');
    const { name, email, password, permissions } = parsed.data;

    const blank = { id: '', isActive: true, permissions: [] };
    const error = adminChangeError(actor, blank, { permissions }, 1);
    if (error) return badRequest(error, 403);

    const existing = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
        select: { id: true },
    });
    if (existing) return badRequest('Já existe um usuário com este e-mail.', 409);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: await bcrypt.hash(password ?? crypto.randomBytes(32).toString('hex'), 10),
            roles: ['master'],
            permissions: [...new Set(permissions)],
            isActive: true,
        },
        select: ADMIN_USER_SELECT,
    });

    let emailSent: boolean | undefined;
    if (!password) {
        try {
            await new ForgotPasswordUseCase(new PrismaUserRepository(prisma)).execute({ email });
            emailSent = true;
        } catch (err) {
            console.error('[admin/users] Falha ao enviar e-mail de definição de senha:', err);
            emailSent = false;
        }
    }

    return NextResponse.json({ success: true, data: user, emailSent }, { status: 201 });
};

export const GET = withHandle(listUsers);
export const POST = withHandle(createUser);
