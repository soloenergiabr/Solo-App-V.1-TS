import bcrypt from 'bcryptjs';
import { UserContextModel } from '../models/user-context.model';
import { JwtService } from './jwt.service';
import { UserRepository } from '../repositories/user.repository';
import { PrismaClient } from '@/app/generated/prisma';
import { eventBus, EventType } from '@/backend/shared/event-bus';

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: {
        id: string;
        email: string;
        name: string;
        roles: string[];
        permissions: string[];
        clientId?: string;
    };
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    address?: string;
    avgEnergyCost?: number;
    enelInvoiceFile?: string;
    indicationCode?: string;
}

export interface RegisterResponse {
    client: {
        id: string;
        name: string;
        email: string;
    };
    message: string;
}


export class AuthService {
    constructor(private userRepository: UserRepository, private prisma: PrismaClient) { }

    async login(request: LoginRequest): Promise<LoginResponse> {
        const { email, password } = request;

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.isActive) {
            throw new Error('Account is disabled');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const userContext = new UserContextModel(
            user.id,
            user.email,
            user.name,
            user.roles,
            user.permissions,
            user.clientId,
            true
        );

        const tokens = JwtService.generateTokenPair(userContext);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                permissions: user.permissions,
                clientId: user.clientId,
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
        };
    }

    async register(request: RegisterRequest): Promise<RegisterResponse> {
        const { name, email, cpfCnpj, phone, address, avgEnergyCost, enelInvoiceFile, indicationCode } = request;

        // Validate that at least one of avgEnergyCost or enelInvoiceFile is provided
        if (!avgEnergyCost && !enelInvoiceFile) {
            throw new Error('Either average energy cost or ENEL invoice must be provided');
        }

        const existingClient = await this.prisma.client.findUnique({
            where: { email },
        });
        if (existingClient) {
            throw new Error('Client with this email already exists');
        }

        const existingCpfCnpj = await this.prisma.client.findUnique({
            where: { cpfCnpj },
        });
        if (existingCpfCnpj) {
            throw new Error('Client with this CPF/CNPJ already exists');
        }

        // Generate unique indication code
        let clientIndicationCode: string;
        do {
            clientIndicationCode = Math.random().toString(36).substring(2, 15);
        } while (await this.prisma.client.findUnique({ where: { indicationCode: clientIndicationCode } }));

        // Create client
        const newClient = await this.prisma.client.create({
            data: {
                name,
                email,
                cpfCnpj,
                phone,
                address,
                avgEnergyCost,
                enelInvoiceFile,
                indicationCode: clientIndicationCode,
                status: 'lead',
            },
        });

        if (indicationCode) {
            const referrer = await this.prisma.client.findUnique({
                where: { indicationCode },
            });
            if (referrer) {
                await this.prisma.indication.create({
                    data: {
                        referrerId: referrer.id,
                        referredId: newClient.id,
                        status: 'pending',
                    },
                });

                eventBus.emit(EventType.INDICATION_CREATED, {
                    name: newClient.name,
                    phone: newClient.phone || '',
                    email: newClient.email,
                    description: `${avgEnergyCost ? `Consumo médio de energia: R$ ${avgEnergyCost}` : ''}`,
                    whoReferring: referrer.name,
                    phoneWhoReferring: referrer.phone || '',
                    idLeadSoloApp: newClient.id,
                });
            }
        }

        return {
            client: {
                id: newClient.id,
                name: newClient.name,
                email: newClient.email,
            },
            message: 'Cadastro realizado com sucesso! Entraremos em contato após análise.',
        };
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
        try {
            const { userId } = JwtService.verifyRefreshToken(refreshToken);
            const user = await this.userRepository.findById(userId);
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }

            const userContext = new UserContextModel(
                user.id,
                user.email,
                user.name,
                user.roles,
                user.permissions,
                user.clientId,
                true
            );

            const accessToken = JwtService.generateToken(userContext);

            return {
                accessToken,
                expiresIn: '24h',
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    async validateToken(token: string): Promise<UserContextModel> {
        const userContext = JwtService.createUserContextFromToken(token);
        const user = await this.userRepository.findById(userContext.userId);
        if (!user || !user.isActive) {
            throw new Error('User not found or inactive');
        }
        return userContext;
    }

    async logout(token: string): Promise<{ message: string }> {
        // TODO: Implementar blacklist de tokens para logout real
        // Por enquanto, apenas retorna sucesso
        return { message: 'Logged out successfully' };
    }
}
