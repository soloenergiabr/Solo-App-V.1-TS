'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/frontend/auth/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuthContext();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login({ email, password });

            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.error || 'Login failed');
            }
        } catch (error) {
            setError('An unexpected error occurred');
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
                        Solo Energy
                    </h2>
                    <p className="mt-2 text-center text-sm text-white/90 drop-shadow-sm">
                        Entre na sua conta para gerenciar seus inversores
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 px-4 py-3 rounded-lg drop-shadow-sm">
                            {error}
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

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/90 drop-shadow-sm">
                                Senha
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Sua senha"
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
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-white/80 drop-shadow-sm">
                            Não tem uma conta?{' '}
                            <a href="/register" className="font-medium text-white hover:text-white/80 transition-colors underline underline-offset-4">
                                Registre-se aqui
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}