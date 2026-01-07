'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, KeyRound, QrCode } from 'lucide-react';
import Image from 'next/image';

export default function PartnerPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [redemptionCode, setRedemptionCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<{
        offer?: { title: string; partner: string; description: string };
        client?: { name: string };
    } | null>(null);
    const [partnerPassword, setPartnerPassword] = useState('');

    const handleLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/partner/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const result = await response.json();

            if (result.success) {
                setPartnerPassword(password);
                setIsAuthenticated(true);
                setPassword('');
            } else {
                setError(result.message);
            }
        } catch {
            setError('Erro ao conectar com o servidor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidate = async () => {
        if (!redemptionCode.trim()) {
            setError('Digite o código do voucher');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/partner/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    redemptionCode: redemptionCode.trim().toUpperCase(),
                    partnerPassword
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess({
                    offer: result.data.offer,
                    client: result.data.client,
                });
                setRedemptionCode('');
            } else {
                setError(result.message);
            }
        } catch {
            setError('Erro ao conectar com o servidor');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSuccess(null);
        setError(null);
        setRedemptionCode('');
    };

    // Login screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4">
                            <Image
                                src="/logo-black-text.png"
                                alt="Logo"
                                width={180}
                                height={50}
                                className="dark:hidden"
                            />
                            <Image
                                src="/logo-white-text.png"
                                alt="Logo"
                                width={180}
                                height={50}
                                className="hidden dark:block"
                            />
                        </div>
                        <CardTitle className="text-2xl">Portal do Parceiro</CardTitle>
                        <CardDescription>
                            Digite a senha de parceiro para acessar
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Senha do parceiro"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button
                            className="w-full"
                            onClick={handleLogin}
                            disabled={isLoading || !password}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <KeyRound className="h-4 w-4 mr-2" />
                            )}
                            Entrar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Success screen
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500/10 to-background p-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="pt-8 space-y-6">
                        <div className="mx-auto w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle className="h-12 w-12 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-green-600 mb-2">
                                Voucher Validado!
                            </h2>
                            <p className="text-muted-foreground">
                                O cliente pode usufruir da oferta
                            </p>
                        </div>
                        <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                            <p><strong>Oferta:</strong> {success.offer?.title}</p>
                            <p><strong>Parceiro:</strong> {success.offer?.partner}</p>
                            <p><strong>Cliente:</strong> {success.client?.name}</p>
                        </div>
                        <Button
                            className="w-full"
                            onClick={handleReset}
                        >
                            Validar outro voucher
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Validation screen
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <QrCode className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Validar Voucher</CardTitle>
                    <CardDescription>
                        Digite o código de 6 caracteres do voucher do cliente
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="text"
                            placeholder="Ex: ABC123"
                            value={redemptionCode}
                            onChange={(e) => setRedemptionCode(e.target.value.toUpperCase())}
                            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                            maxLength={6}
                            className="text-center text-2xl tracking-widest font-mono uppercase"
                        />
                    </div>
                    {error && (
                        <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <Button
                        className="w-full"
                        onClick={handleValidate}
                        disabled={isLoading || redemptionCode.length !== 6}
                        size="lg"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Validar
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
