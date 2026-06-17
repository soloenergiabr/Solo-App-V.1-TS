'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('As senhas não coincidem');
            setIsLoading(false);
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setStatus('error');
            setMessage('A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e número');
            setIsLoading(false);
            return;
        }
        if (!token) {
            setStatus('error');
            setMessage('Link inválido ou expirado');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setStatus('success');
                setMessage('Senha alterada com sucesso!');
                setPassword('');
                setConfirmPassword('');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Erro ao redefinir senha. Tente novamente.');
            }
        } catch {
            setStatus('error');
            setMessage('Ocorreu um erro inesperado. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1 text-center lg:text-left">
                <h2 className="font-display text-2xl font-bold text-foreground">Redefinir senha</h2>
                <p className="text-sm text-muted-foreground">Digite sua nova senha abaixo</p>
            </div>

            {message && (
                <Alert variant={status === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            {status === 'success' ? (
                <div className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">Redirecionando para o login...</p>
                    <Link href="/login" className="inline-block w-full">
                        <Button type="button" className="h-11 w-full">Ir para o login</Button>
                    </Link>
                </div>
            ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="password">Nova senha</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="8+ caracteres (A-Z, a-z, 0-9)"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar senha</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                minLength={8}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Digite a senha novamente"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="h-11 w-full">
                        {isLoading ? 'Alterando senha...' : 'Alterar senha'}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Lembrou sua senha?{' '}
                        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                            Voltar para login
                        </Link>
                    </p>
                </form>
            )}
        </div>
    );
}
