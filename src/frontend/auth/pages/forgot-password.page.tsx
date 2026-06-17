'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessageType('success');
                setMessage(data.message || 'Se o email existir, enviamos um link de recuperação.');
                setEmail('');
            } else {
                setMessageType('error');
                setMessage(data.message || 'Ocorreu um erro. Tente novamente.');
            }
        } catch {
            setMessageType('error');
            setMessage('Ocorreu um erro inesperado. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1 text-center lg:text-left">
                <h2 className="font-display text-2xl font-bold text-foreground">Recuperar senha</h2>
                <p className="text-sm text-muted-foreground">
                    Digite seu email para receber o link de redefinição
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                {message && (
                    <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
                        <AlertDescription>{message}</AlertDescription>
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

                <Button type="submit" disabled={isLoading} className="h-11 w-full">
                    {isLoading ? 'Enviando...' : 'Enviar link'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Lembrou sua senha?{' '}
                    <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                        Voltar para login
                    </Link>
                </p>
            </form>
        </div>
    );
}
