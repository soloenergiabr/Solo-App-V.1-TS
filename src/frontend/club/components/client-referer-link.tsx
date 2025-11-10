"use client";

import { useState } from 'react';
import { useRefererLink } from '../hooks/useRefererLink';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingPage } from '@/components/ui/loading';
import { Copy, Check } from 'lucide-react';

export function ClientRefererLink() {
    const { link, isLoading, error, copyToClipboard } = useRefererLink();
    const [copied, setCopied] = useState(false);

    const handleCopyClick = async () => {
        const success = await copyToClipboard();
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <LoadingPage />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Link de Indicação</CardTitle>
                    <CardDescription>Compartilhe seu link personalizado</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-600">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Link de Indicação</CardTitle>
                <CardDescription>Compartilhe seu link personalizado e ganhe SOLO Coins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-2">
                    <Input
                        value={link || ''}
                        readOnly
                        className="flex-1"
                        placeholder="Carregando link..."
                    />
                    <Button
                        onClick={handleCopyClick}
                        variant="outline"
                        size="icon"
                        disabled={!link}
                    >
                        {copied ? (
                            <Check className="h-4 w-4 text-green-600" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {copied && (
                    <p className="text-sm text-green-600">
                        Link copiado para a área de transferência!
                    </p>
                )}

                <div className="text-sm text-muted-foreground">
                    <p>
                        ✅ Cada indicação aprovada gera <strong>5%</strong> do valor do projeto em <strong>SOLO Coins</strong> para você
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
