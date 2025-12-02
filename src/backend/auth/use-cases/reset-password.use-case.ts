import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';

interface ResetPasswordInput {
    token: string;
    newPassword: string;
}

export class ResetPasswordUseCase {
    constructor(private userRepository: UserRepository) { }

    async execute({ token, newPassword }: ResetPasswordInput): Promise<void> {
        // Passo 1: Buscar o usuário pelo token
        const user = await this.userRepository.findByResetToken(token);

        // Passo 2: Validação de Token
        if (!user) {
            throw new Error('Invalid token');
        }

        // Passo 3: Validação de Expiração
        if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
            throw new Error('Token expired');
        }

        // Passo 4: Hash da nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Passo 5: Atualização do usuário (limpar token e atualizar senha)
        await this.userRepository.update({
            id: user.id,
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });
    }
}
