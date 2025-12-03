import nodemailer from 'nodemailer';

interface SendMailParams {
    to: string;
    subject: string;
    html: string;
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    } : undefined,
});

export async function sendMail({ to, subject, html }: SendMailParams): Promise<void> {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'Solo Energy <noreply@solo-energia.com>',
            to,
            subject,
            html,
        });

        console.log('Email sent successfully. Message ID:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
