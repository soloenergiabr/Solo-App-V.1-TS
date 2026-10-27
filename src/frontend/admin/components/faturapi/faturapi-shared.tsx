'use client';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const STATUS: Record<string, { label: string; variant: BadgeVariant }> = {
    // Unidade
    active: { label: 'Ativa', variant: 'default' },
    paused: { label: 'Pausada', variant: 'secondary' },
    needs_credentials: { label: 'Senha invalida', variant: 'destructive' },
    overdue: { label: 'Fatura atrasada', variant: 'destructive' },
    // Conexao
    syncing: { label: 'Sincronizando', variant: 'secondary' },
    error: { label: 'Erro', variant: 'destructive' },
    // Extracao
    pending: { label: 'Na fila', variant: 'secondary' },
    processing: { label: 'Buscando', variant: 'secondary' },
    completed: { label: 'Concluida', variant: 'default' },
    failed: { label: 'Falhou', variant: 'destructive' },
    // Webhook
    received: { label: 'Recebido', variant: 'secondary' },
    processed: { label: 'Processado', variant: 'default' },
};

export function FaturapiStatusBadge({ status }: { status: string | null | undefined }) {
    if (!status) return <Badge variant="outline">Nao vinculada</Badge>;
    const config = STATUS[status] ?? { label: status, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
}

const TRIGGER: Record<string, string> = {
    schedule: 'Agendada',
    api: 'API',
    dashboard: 'Painel Faturapi',
    backfill: 'Historico',
    retry: 'Nova tentativa',
};

export function triggerLabel(trigger: string) {
    return TRIGGER[trigger] ?? trigger;
}

export function formatDate(value: string | null | undefined) {
    if (!value) return '—';
    // Datas puras (YYYY-MM-DD) sem fuso, para nao voltar um dia.
    const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
    return date.toLocaleDateString('pt-BR');
}

export function formatDateTime(value: string | null | undefined) {
    if (!value) return '—';
    return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatCents(cents: number | null | undefined) {
    if (cents == null) return '—';
    return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function errorText(error: unknown): string | null {
    if (!error) return null;
    if (typeof error === 'string') return error;
    const value = error as { code?: string; message?: string };
    return [value.code, value.message].filter(Boolean).join(': ') || null;
}

export type CredentialsForm = { source: 'pessoa' | 'empresa'; email: string; password: string };

export const emptyCredentials: CredentialsForm = { source: 'pessoa', email: '', password: '' };

/** Login da distribuidora (Enel). A senha vai direto para a Faturapi e nao e salva no app. */
export function CredentialsFields({
    value,
    onChange,
    showSource = true,
}: {
    value: CredentialsForm;
    onChange: (value: CredentialsForm) => void;
    showSource?: boolean;
}) {
    return (
        <div className="space-y-3">
            {showSource && (
                <div className="space-y-1.5">
                    <Label>Tipo de conta</Label>
                    <Select value={value.source} onValueChange={(source) => onChange({ ...value, source: source as CredentialsForm['source'] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pessoa">Pessoa fisica</SelectItem>
                            <SelectItem value="empresa">Empresa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="space-y-1.5">
                <Label>Login da Enel (e-mail ou CPF/CNPJ)</Label>
                <Input value={value.email} autoComplete="off" onChange={(e) => onChange({ ...value, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
                <Label>Senha da Enel</Label>
                <Input type="password" value={value.password} autoComplete="new-password" onChange={(e) => onChange({ ...value, password: e.target.value })} />
            </div>
            <p className="text-xs text-muted-foreground">
                A senha vai direto para a Faturapi, que guarda criptografada. Ela nao fica salva no app.
            </p>
        </div>
    );
}

export function credentialsReady(value: CredentialsForm) {
    return value.email.trim().length > 0 && value.password.length > 0;
}
