'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setMessageType(null);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessageType('success');
                setMessage(data.message || 'If the email exists, a recovery link has been sent.');
                setEmail(''); // Limpar o campo
            } else {
                setMessageType('error');
                setMessage(data.message || 'An error occurred. Please try again.');
            }
        } catch (error) {
            setMessageType('error');
            setMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat py-12 px-4 sm:px-6 lg:px-8 relative"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1613665813446-82a78c468a1d?ixlib?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80&sat=-100')",
            }}>
            {/* Overlay escuro para melhorar legibilidade */}
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="max-w-md w-full space-y-8 relative z-10 bg-white/20 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
                <div className="rounded-2xl p-4">
                    <h2 className="text-center text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
                        Recuperação de Senha
                    </h2>
                    <p className="mt-2 text-center text-sm text-white/90 drop-shadow-sm">
                        Digite seu e-mail para receber o link de redefinição
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {message && (
                        <div className={`${messageType === 'success'
                                ? 'bg-green-500/20 border-green-400/30 text-green-100'
                                : 'bg-red-500/20 border-red-400/30 text-red-100'
                            } backdrop-blur-sm border px-4 py-3 rounded-lg drop-shadow-sm`}>
                            {message}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50"
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className='w-full h-12 sm:h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-sm font-medium'
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Link'}
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-white/80 drop-shadow-sm">
                            Lembrou sua senha?{' '}
                            <Link href="/login" className="font-medium text-white hover:text-white/80 transition-colors underline underline-offset-4">
                                Voltar para Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
