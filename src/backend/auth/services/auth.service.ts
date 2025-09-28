import bcrypt from 'bcryptjs';
import { UserContextModel } from '../models/user-context.model';
import { JwtService } from './jwt.service';

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
    email: string;
    password: string;
    name: string;
    clientId?: string;
}

export interface RegisterResponse {
    user: {
        id: string;
        email: string;
        name: string;
    };
    message: string;
}

// Interface para o repositório de usuários (será implementado com Prisma)
export interface UserRepository {
    findByEmail(email: string): Promise<User | null>;
    create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    findById(id: string): Promise<User | null>;
}

export interface User {
    id: string;
    email: string;
    password: string;
    name: string;
    roles: string[];
    permissions: string[];
    clientId?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class AuthService {
    constructor(private userRepository: UserRepository) { }

    /**
     * Autentica um usuário com email e senha
     */
    async login(request: LoginRequest): Promise<LoginResponse> {
        const { email, password } = request;

        // Buscar usuário por email
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Verificar se o usuário está ativo
        if (!user.isActive) {
            throw new Error('Account is disabled');
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Criar UserContext
        const userContext = new UserContextModel(
            user.id,
            user.email,
            user.name,
            user.roles,
            user.permissions,
            user.clientId,
            true
        );

        // Gerar tokens
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

    /**
     * Registra um novo usuário
     */
    async register(request: RegisterRequest): Promise<RegisterResponse> {
        const { email, password, name, clientId } = request;

        // Verificar se o usuário já existe
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Validar senha (mínimo 8 caracteres)
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 12);

        // Definir roles e permissões padrão
        const defaultRoles = ['user'];
        const defaultPermissions = [
            'read_inverters',
            'create_inverter',
            'read_generation_data',
            'create_generation_unit'
        ];

        // Criar usuário
        const newUser = await this.userRepository.create({
            email,
            password: hashedPassword,
            name,
            roles: defaultRoles,
            permissions: defaultPermissions,
            clientId,
            isActive: true,
        });

        return {
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            },
            message: 'User registered successfully',
        };
    }

    /**
     * Renova um token usando refresh token
     */
    async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: string }> {
        try {
            // Verificar refresh token
            const { userId } = JwtService.verifyRefreshToken(refreshToken);

            // Buscar usuário
            const user = await this.userRepository.findById(userId);
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive');
            }

            // Criar UserContext
            const userContext = new UserContextModel(
                user.id,
                user.email,
                user.name,
                user.roles,
                user.permissions,
                user.clientId,
                true
            );

            // Gerar novo access token
            const accessToken = JwtService.generateToken(userContext);

            return {
                accessToken,
                expiresIn: '24h',
            };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    /**
     * Valida um token de acesso
     */
    async validateToken(token: string): Promise<UserContextModel> {
        try {
            return JwtService.createUserContextFromToken(token);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    /**
     * Logout (invalidar tokens - implementação futura com blacklist)
     */
    async logout(token: string): Promise<{ message: string }> {
        // TODO: Implementar blacklist de tokens para logout real
        // Por enquanto, apenas retorna sucesso
        return { message: 'Logged out successfully' };
    }
}
