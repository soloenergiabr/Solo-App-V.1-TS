'use client';

import { useState, type ComponentProps, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';

type BillPdfButtonProps = Omit<ComponentProps<typeof Button>, 'onClick' | 'asChild'> & {
    billId: string;
    children: ReactNode;
};

/**
 * Abre o PDF da fatura via /api/energy-bills/:id/file. O token fica no
 * localStorage, entao um <a href> simples nao autentica: baixa com o token e
 * abre como blob numa nova aba.
 */
export function BillPdfButton({ billId, children, disabled, ...props }: BillPdfButtonProps) {
    const api = useAuthenticatedApi();
    const [loading, setLoading] = useState(false);

    async function openPdf() {
        // Abre a aba ainda no clique para nao ser barrada pelo bloqueador de pop-up.
        const tab = window.open('', '_blank');
        setLoading(true);
        try {
            const response = await api.get<Blob>(`/energy-bills/${billId}/file`, { responseType: 'blob' });
            const url = URL.createObjectURL(response.data);
            if (tab) tab.location.href = url;
            else window.location.href = url;
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch {
            tab?.close();
            toast.error('Nao foi possivel abrir o PDF da fatura.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button {...props} disabled={disabled || loading} onClick={openPdf}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {children}
        </Button>
    );
}
