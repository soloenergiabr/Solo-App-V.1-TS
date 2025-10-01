import bcrypt from 'bcryptjs';
import { UserContextModel } from '../models/user-context.model';
import { JwtService } from './jwt.service';
import { UserRepository } from '../repositories/user.repository';

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


export class AuthService {
    constructor(private userRepository: UserRepository) { }

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
        const { email, password, name, clientId } = request;

        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        const hashedPassword = await bcrypt.hash(password, 12);

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
