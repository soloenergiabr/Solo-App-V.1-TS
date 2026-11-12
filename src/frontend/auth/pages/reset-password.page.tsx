'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordValues } from '@/frontend/auth/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';

export function ResetPasswordPage() {
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const form = useForm<ResetPasswordValues>({
        resolver: zodResolver(resetPasswordSchema),
        mode: 'onTouched',
        defaultValues: { password: '', confirmPassword: '' },
    });
    const { isSubmitting, isValid } = form.formState;

    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const onSubmit = async ({ password }: ResetPasswordValues) => {
        setMessage('');
        setStatus('idle');

        if (!token) {
            setStatus('error');
            setMessage('Link inválido ou expirado');
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
                form.reset();
                setTimeout(() => router.push('/login'), 2000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Erro ao redefinir senha. Tente novamente.');
            }
        } catch {
            setStatus('error');
            setMessage('Ocorreu um erro inesperado. Tente novamente.');
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
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                        <FormField
                            control={form.control}
                            name="password"
                            // Revalida a confirmação quando a senha muda depois de confirmada.
                            rules={{ deps: 'confirmPassword' }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nova senha</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="new-password"
                                                placeholder="8+ caracteres (A-Z, a-z, 0-9)"
                                                className="pr-10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar senha</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                autoComplete="new-password"
                                                placeholder="Digite a senha novamente"
                                                className="pr-10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" disabled={isSubmitting || !isValid} className="h-11 w-full">
                            {isSubmitting ? 'Alterando senha...' : 'Alterar senha'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Lembrou sua senha?{' '}
                            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                                Voltar para login
                            </Link>
                        </p>
                    </form>
                </Form>
            )}
        </div>
    );
}
