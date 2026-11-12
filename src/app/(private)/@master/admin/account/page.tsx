'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiErrorMessage, useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { useAuthContext, withAuth } from '@/frontend/auth/contexts/auth-context';
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

function AccountPage() {
    const api = useAuthenticatedApi();
    const { user } = useAuthContext();
    const [form, setForm] = useState(EMPTY);

    const change = useMutation({
        mutationFn: () => api.post('/auth/change-password', form),
        onSuccess: () => {
            toast.success('Senha alterada com sucesso.');
            setForm(EMPTY);
        },
        onError: (err) => toast.error(apiErrorMessage(err, 'Erro ao alterar a senha')),
    });

    const field = (key: keyof typeof EMPTY, label: string, autoComplete: string) => (
        <div className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
                id={key}
                type="password"
                autoComplete={autoComplete}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
            />
        </div>
    );

    return (
        <PageLayout header={<PageHeader title="Minha conta" subtitle={user ? `${user.name} · ${user.email}` : undefined} />}>
            <Card className="max-w-lg">
                <CardHeader>
                    <CardTitle>Alterar senha</CardTitle>
                    <CardDescription>Mínimo de 8 caracteres, com letra maiúscula, letra minúscula e número.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); change.mutate(); }}>
                        {field('currentPassword', 'Senha atual', 'current-password')}
                        {field('newPassword', 'Nova senha', 'new-password')}
                        {field('confirmPassword', 'Confirmar nova senha', 'new-password')}
                        <Button type="submit" disabled={change.isPending}>
                            {change.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                            Alterar senha
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </PageLayout>
    );
}

export default withAuth(AccountPage, ['master']);
