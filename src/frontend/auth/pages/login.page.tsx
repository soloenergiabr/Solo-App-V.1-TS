'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthContext } from '@/frontend/auth/contexts/auth-context';
import { loginSchema, type LoginValues } from '@/frontend/auth/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function LoginPage() {
    const [error, setError] = useState('');
    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        mode: 'onTouched',
        defaultValues: { email: '', password: '' },
    });
    // Botão sempre ativo: o autofill do Chrome só libera a senha após um clique na página.
    const { isSubmitting } = form.formState;

    const { login } = useAuthContext();
    const router = useRouter();

    const onSubmit = async (values: LoginValues) => {
        setError('');
        try {
            const result = await login(values);
            if (result.success) {
                // /controle e a home do cliente; o admin (master) nao tem essa rota.
                router.push(result.user?.roles?.includes('master') ? '/dashboard' : '/controle');
            } else {
                setError(result.error || 'Não foi possível entrar');
            }
        } catch {
            setError('Ocorreu um erro inesperado');
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

            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" autoComplete="email" placeholder="seu@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                    <Input type="password" autoComplete="current-password" placeholder="Sua senha" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
                        {isSubmitting ? 'Entrando...' : 'Entrar'}
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
            </Form>
        </div>
    );
}
