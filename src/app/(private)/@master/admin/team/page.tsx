'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, ShieldCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { apiErrorMessage, useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { useAuthContext, withAuth } from '@/frontend/auth/contexts/auth-context';
import { PageEmpty, PageHeader, PageLayout } from '@/components/ui/page-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ALL_PERMISSIONS, PERMISSION_GROUPS, PERMISSION_PRESETS } from '@/shared/admin-users/permissions';

type AdminUser = {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    permissions: string[];
    createdAt: string;
};

const QUERY_KEY = ['admin-users'] as const;

function permissionSummary(permissions: string[]) {
    const presetMatch = PERMISSION_PRESETS.find(
        (p) => p.permissions.length === permissions.length && p.permissions.every((k) => permissions.includes(k)),
    );
    if (presetMatch) return presetMatch.label;
    return `${permissions.filter((p) => (ALL_PERMISSIONS as string[]).includes(p)).length} de ${ALL_PERMISSIONS.length} permissões`;
}

function PermissionChecklist({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
    const toggle = (key: string, checked: boolean) =>
        onChange(checked ? [...value, key] : value.filter((p) => p !== key));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {PERMISSION_PRESETS.map((preset) => (
                    <Button key={preset.label} type="button" size="sm" variant="outline" onClick={() => onChange([...preset.permissions])}>
                        {preset.label}
                    </Button>
                ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                {PERMISSION_GROUPS.map((group) => (
                    <fieldset key={group.label} className="space-y-2 rounded-md border p-3">
                        <legend className="px-1 text-sm font-medium">{group.label}</legend>
                        {group.permissions.map((perm) => (
                            <div key={perm.key} className="flex items-center gap-2">
                                <Checkbox
                                    id={`perm-${perm.key}`}
                                    checked={value.includes(perm.key)}
                                    onCheckedChange={(checked) => toggle(perm.key, checked === true)}
                                />
                                <Label htmlFor={`perm-${perm.key}`} className="text-sm font-normal">
                                    {perm.label}
                                </Label>
                            </div>
                        ))}
                    </fieldset>
                ))}
            </div>
        </div>
    );
}

function CreateUserDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const api = useAuthenticatedApi();
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [sendEmail, setSendEmail] = useState(false);
    const [password, setPassword] = useState('');
    const [permissions, setPermissions] = useState<string[]>([...PERMISSION_PRESETS[1].permissions]);

    const create = useMutation({
        mutationFn: async () => {
            const res = await api.post('/admin/users', {
                name,
                email,
                permissions,
                ...(sendEmail ? {} : { password }),
            });
            return res.data as { emailSent?: boolean };
        },
        onSuccess: (data) => {
            if (data.emailSent === false) {
                toast.warning('Usuário criado, mas o e-mail não foi enviado. Peça que use "Esqueci minha senha" no login.');
            } else {
                toast.success(sendEmail ? 'Usuário criado. Enviamos um e-mail para definir a senha.' : 'Usuário criado.');
            }
            void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            onOpenChange(false);
            setName(''); setEmail(''); setPassword(''); setSendEmail(false);
        },
        onError: (err) => toast.error(apiErrorMessage(err, 'Erro ao criar usuário')),
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Novo usuário administrativo</DialogTitle>
                    <DialogDescription>Ele terá acesso ao painel administrativo com as permissões marcadas.</DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="new-name">Nome</Label>
                            <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-email">E-mail</Label>
                            <Input id="new-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox id="send-email" checked={sendEmail} onCheckedChange={(c) => setSendEmail(c === true)} />
                        <Label htmlFor="send-email" className="font-normal">
                            Enviar e-mail para o usuário definir a própria senha
                        </Label>
                    </div>
                    {!sendEmail && (
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Senha inicial</Label>
                            <Input
                                id="new-password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Mínimo de 8 caracteres, com letra maiúscula, letra minúscula e número.
                            </p>
                        </div>
                    )}
                    <PermissionChecklist value={permissions} onChange={setPermissions} />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={create.isPending}>
                            {create.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                            Criar usuário
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditPermissionsDialog({ user, onClose }: { user: AdminUser; onClose: () => void }) {
    const api = useAuthenticatedApi();
    const queryClient = useQueryClient();
    const [permissions, setPermissions] = useState(user.permissions);

    const save = useMutation({
        mutationFn: () => api.patch(`/admin/users/${user.id}`, { permissions }),
        onSuccess: () => {
            toast.success('Permissões atualizadas. Valem a partir do próximo login do usuário.');
            void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            onClose();
        },
        onError: (err) => toast.error(apiErrorMessage(err, 'Erro ao salvar permissões')),
    });

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Permissões de {user.name}</DialogTitle>
                    <DialogDescription>{user.email}</DialogDescription>
                </DialogHeader>
                <PermissionChecklist value={permissions} onChange={setPermissions} />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={() => save.mutate()} disabled={save.isPending}>
                        {save.isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TeamPage() {
    const api = useAuthenticatedApi();
    const queryClient = useQueryClient();
    const { user: me } = useAuthContext();
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<AdminUser | null>(null);

    const { data: users, isLoading, error } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () => (await api.get<{ data: AdminUser[] }>('/admin/users')).data.data,
        retry: false,
    });

    const toggleActive = useMutation({
        mutationFn: (u: AdminUser) => api.patch(`/admin/users/${u.id}`, { isActive: !u.isActive }),
        onSuccess: (_res, u) => {
            toast.success(u.isActive ? 'Usuário desativado.' : 'Usuário ativado.');
            void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
        onError: (err) => toast.error(apiErrorMessage(err, 'Erro ao alterar status')),
    });

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Equipe e permissões"
                    subtitle="Usuários com acesso ao painel administrativo"
                    actions={
                        <Button onClick={() => setCreating(true)}>
                            <Plus className="mr-1 h-4 w-4" />
                            Novo usuário
                        </Button>
                    }
                />
            }
        >
            <Card>
                <CardContent className="p-0">
                    {isLoading && (
                        <div className="flex h-48 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {error && (
                        <PageEmpty
                            icon={<ShieldCheck className="h-9 w-9 text-muted-foreground" />}
                            title="Não foi possível carregar a equipe"
                            description={apiErrorMessage(error, 'Tente novamente em instantes.')}
                        />
                    )}
                    {users && users.length === 0 && (
                        <PageEmpty icon={<Users className="h-9 w-9 text-muted-foreground" />} title="Nenhum usuário administrativo" />
                    )}
                    {users && users.length > 0 && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Permissões</TableHead>
                                    <TableHead>Criado em</TableHead>
                                    <TableHead>Ativo</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">
                                            {u.name}
                                            {u.id === me?.id && <Badge variant="secondary" className="ml-2">Você</Badge>}
                                        </TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{permissionSummary(u.permissions)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={u.isActive}
                                                disabled={u.id === me?.id || toggleActive.isPending}
                                                onCheckedChange={() => toggleActive.mutate(u)}
                                                aria-label={u.isActive ? `Desativar ${u.name}` : `Ativar ${u.name}`}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" onClick={() => setEditing(u)}>
                                                Editar permissões
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CreateUserDialog open={creating} onOpenChange={setCreating} />
            {editing && <EditPermissionsDialog user={editing} onClose={() => setEditing(null)} />}
        </PageLayout>
    );
}

export default withAuth(TeamPage, ['master']);
