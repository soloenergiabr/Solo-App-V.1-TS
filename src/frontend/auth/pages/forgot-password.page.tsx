'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/frontend/auth/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ForgotPasswordPage() {
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
    const form = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: 'onTouched',
        defaultValues: { email: '' },
    });
    const { isSubmitting, isValid } = form.formState;

    const onSubmit = async (values: ForgotPasswordValues) => {
        setMessage('');
        setMessageType(null);
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            const data = await response.json();
            if (response.ok) {
                setMessageType('success');
                setMessage(data.message || 'Se o email existir, enviamos um link de recuperação.');
                form.reset();
            } else {
                setMessageType('error');
                setMessage(data.message || 'Ocorreu um erro. Tente novamente.');
            }
        } catch {
            setMessageType('error');
            setMessage('Ocorreu um erro inesperado. Tente novamente.');
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

            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                    {message && (
                        <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
                            <AlertDescription>{message}</AlertDescription>
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

                    <Button type="submit" disabled={isSubmitting || !isValid} className="h-11 w-full">
                        {isSubmitting ? 'Enviando...' : 'Enviar link'}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Lembrou sua senha?{' '}
                        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                            Voltar para login
                        </Link>
                    </p>
                </form>
            </Form>
        </div>
    );
}
