'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/frontend/auth/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
                router.push('/controle');
            } else {
                setError(result.error || 'Não foi possível entrar');
            }
        } catch {
            setError('Ocorreu um erro inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1 text-center lg:text-left">
                <h2 className="font-display text-2xl font-bold text-foreground">Entrar</h2>
                <p className="text-sm text-muted-foreground">
                    Acesse o painel da sua energia
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Sua senha"
                    />
                </div>

                <Button type="submit" disabled={isLoading} className="h-11 w-full">
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>

                <div className="text-center text-sm">
                    <Link
                        href="/forgot-password"
                        className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                        Recuperar senha
                    </Link>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
                        Registre-se aqui
                    </Link>
                </p>
            </form>
        </div>
    );
}
