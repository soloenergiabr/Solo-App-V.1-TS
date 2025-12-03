import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { sendMail } from '@/lib/mail';
import { config } from '@/config';

interface ForgotPasswordInput {
  email: string;
}

export class ForgotPasswordUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute({ email }: ForgotPasswordInput): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    const resetPasswordToken = crypto.randomBytes(32).toString('hex');

    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

    await this.userRepository.update({
      id: user.id,
      resetPasswordToken,
      resetPasswordExpires,
    });

    const baseUrl = config.base_url;
    const resetLink = `${baseUrl}/reset-password?token=${resetPasswordToken}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Recuperação de Senha</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Recuperação de Senha - Solo Energy</h2>
            <p>Olá, <strong>${user.name}</strong>!</p>
            <p>Você solicitou a recuperação de sua senha. Clique no link abaixo para redefinir sua senha:</p>
            <p style="margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Redefinir Senha
              </a>
            </p>
            <p style="color: #7f8c8d; font-size: 14px;">
              Este link expira em 1 hora.
            </p>
            <p style="color: #7f8c8d; font-size: 14px;">
              Se você não solicitou a recuperação de senha, ignore este e-mail.
            </p>
            <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
            <p style="color: #95a5a6; font-size: 12px;">
              © ${new Date().getFullYear()} Solo Energy. Todos os direitos reservados.
            </p>
          </div>
        </body>
      </html>
    `;

    await sendMail({
      to: user.email,
      subject: 'Recuperação de Senha - Solo Energy',
      html: htmlContent,
    });
  }
}
