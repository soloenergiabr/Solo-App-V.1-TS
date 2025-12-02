'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

export function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setStatus('idle');

        // Validação: verificar se as senhas coincidem
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('As senhas não coincidem');
            setIsLoading(false);
            return;
        }

        // Validação: verificar requisitos de senha
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setStatus('error');
            setMessage('A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e número');
            setIsLoading(false);
            return;
        }

        // Validação: verificar se há token
        if (!token) {
            setStatus('error');
            setMessage('Link inválido ou expirado');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Senha alterada com sucesso!');
                setPassword('');
                setConfirmPassword('');

                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Erro ao redefinir senha. Tente novamente.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Ocorreu um erro inesperado. Tente novamente.');
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
                        Redefinir Senha
                    </h2>
                    <p className="mt-2 text-center text-sm text-white/90 drop-shadow-sm">
                        Digite sua nova senha abaixo
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {message && (
                        <div className={`${status === 'success'
                            ? 'bg-green-500/20 border-green-400/30 text-green-100'
                            : 'bg-red-500/20 border-red-400/30 text-red-100'
                            } backdrop-blur-sm border px-4 py-3 rounded-lg drop-shadow-sm`}>
                            {message}
                        </div>
                    )}

                    {status === 'success' ? (
                        <div className="text-center space-y-4">
                            <p className="text-white/90 text-sm drop-shadow-sm">
                                Redirecionando para o login...
                            </p>
                            <Link
                                href="/login"
                                className="inline-block w-full"
                            >
                                <Button
                                    type="button"
                                    className='w-full h-12 sm:h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-sm font-medium'
                                >
                                    Ir para o Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm">
                                        Nova Senha
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            minLength={8}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="8+ caracteres (A-Z, a-z, 0-9)"
                                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2 drop-shadow-sm">
                                        Confirmar Senha
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            required
                                            minLength={8}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Digite a senha novamente"
                                            className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-white/50 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className='w-full h-12 sm:h-10 bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-sm font-medium'
                                >
                                    {isLoading ? 'Alterando senha...' : 'Alterar Senha'}
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
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
