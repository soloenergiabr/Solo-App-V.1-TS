'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/frontend/auth/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cpfCnpj: '',
        phone: '',
        address: '',
        avgEnergyCost: '',
        enelInvoiceFile: null as File | null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [indicationCode, setIndicationCode] = useState<string | null>(null);

    const { register } = useAuthContext();
    const searchParams = useSearchParams();

    useEffect(() => {
        const indication = searchParams.get('indication');
        if (indication) {
            setIndicationCode(indication);
        }
    }, [searchParams]);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0],
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        // Validate required fields
        if (!formData.avgEnergyCost && !formData.enelInvoiceFile) {
            setError('Você deve fornecer a média de custo de energia ou o arquivo da conta ENEL.');
            setIsLoading(false);
            return;
        }

        try {
            let enelInvoiceFileBase64: string | undefined;
            if (formData.enelInvoiceFile) {
                enelInvoiceFileBase64 = await fileToBase64(formData.enelInvoiceFile);
            }

            const result = await register({
                name: formData.name,
                email: formData.email,
                cpfCnpj: formData.cpfCnpj,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
                avgEnergyCost: formData.avgEnergyCost ? parseFloat(formData.avgEnergyCost) : undefined,
                enelInvoiceFile: enelInvoiceFileBase64,
                indicationCode: indicationCode || undefined,
            });

            if (result.success) {
                setSuccess(result.message || 'Cadastro realizado com sucesso!');
            } else {
                setError(result.error || 'Erro no cadastro');
            }
        } catch (error) {
            setError('Erro inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWhatsAppContact = () => {
        const message = encodeURIComponent('Olá! Tenho dúvidas sobre o cadastro na Solo Energy.');
        window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-green-600">Cadastro Concluído!</CardTitle>
                        <CardDescription className="text-center">
                            {success}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Em breve nossa equipe entrará em contato para análise do seu perfil.
                        </p>
                        <Button onClick={handleWhatsAppContact} className="w-full">
                            📱 Entrar em Contato pelo WhatsApp
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Solo Energy - Cadastro</CardTitle>
                    <CardDescription className="text-center">
                        Cadastre-se para gerenciar seus inversores solares
                        {indicationCode && (
                            <span className="block text-sm text-green-600 mt-1">
                                Você foi indicado! Código: {indicationCode}
                            </span>
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert className="mb-4" variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success && (
                        <Alert className="mb-4">
                            <AlertDescription>{success}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Seu nome completo"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                            <Input
                                id="cpfCnpj"
                                name="cpfCnpj"
                                type="text"
                                required
                                value={formData.cpfCnpj}
                                onChange={handleChange}
                                placeholder="CPF ou CNPJ"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(11) 99999-9999"
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Endereço</Label>
                            <Input
                                id="address"
                                name="address"
                                type="text"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Seu endereço"
                            />
                        </div>

                        <div>
                            <Label htmlFor="avgEnergyCost">Média de Custo de Energia (R$/mês)</Label>
                            <Input
                                id="avgEnergyCost"
                                name="avgEnergyCost"
                                type="number"
                                step="0.01"
                                value={formData.avgEnergyCost}
                                onChange={handleChange}
                                placeholder="Ex: 350.00"
                            />
                        </div>

                        <div>
                            <Label htmlFor="enelInvoiceFile">Arquivo da Conta ENEL (PDF)</Label>
                            <Input
                                id="enelInvoiceFile"
                                name="enelInvoiceFile"
                                type="file"
                                accept=".pdf"
                                onChange={handleChange}
                            />
                        </div>

                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                        </Button>
                    </form>

                    {!success && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-600">
                                Já é cliente?{' '}
                                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                    Faça login aqui
                                </a>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}