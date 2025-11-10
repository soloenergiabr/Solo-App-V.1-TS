'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/frontend/auth/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Check, Sun, Zap, TrendingUp, Users } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "Bem-vindo à Solo Energy",
        description: "Transforme sua energia solar em economia real",
        icon: Sun,
        content: "A Solo Energy conecta você ao futuro da energia sustentável. Gerencie seus inversores solares, acompanhe sua produção e maximize seus ganhos com energia limpa."
    },
    {
        id: 2,
        title: "Dados Pessoais",
        description: "Vamos começar seu cadastro",
        icon: Users,
        content: "Precisamos de algumas informações básicas para criar sua conta e personalizar sua experiência."
    },
    {
        id: 3,
        title: "Contato & Localização",
        description: "Onde podemos te encontrar",
        icon: Zap,
        content: "Essas informações nos ajudam a oferecer suporte personalizado e otimizar suas configurações de energia solar."
    },
    {
        id: 4,
        title: "Perfil Energético",
        description: "Conte sobre seu consumo",
        icon: TrendingUp,
        content: "Entenda melhor seu padrão de consumo para receber recomendações personalizadas e maximizar sua economia."
    }
];

export function RegisterPage() {
    const [currentStep, setCurrentStep] = useState(1);
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

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
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

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                            <Sun className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">Energia Solar Inteligente</h3>
                            <p className="text-white/90 text-base sm:text-lg leading-relaxed">
                                Transforme sua energia solar em economia real. Monitore sua produção,
                                otimize seu consumo e maximize seus ganhos com tecnologia de ponta.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <p className="text-white text-sm">Monitoramento em Tempo Real</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <p className="text-white text-sm">Economia Garantida</p>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-white/90">Nome Completo</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Seu nome completo"
                                className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 h-12 sm:h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-white/90">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="seu@email.com"
                                className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 h-12 sm:h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="cpfCnpj" className="text-white/90">CPF/CNPJ</Label>
                            <Input
                                id="cpfCnpj"
                                name="cpfCnpj"
                                type="text"
                                required
                                value={formData.cpfCnpj}
                                onChange={handleChange}
                                placeholder="CPF ou CNPJ"
                                className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 h-12 sm:h-10"
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="phone" className="text-white/90">Telefone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(11) 99999-9999"
                                className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 h-12 sm:h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="address" className="text-white/90">Endereço</Label>
                            <Input
                                id="address"
                                name="address"
                                type="text"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Rua, número, bairro, cidade"
                                className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 h-12 sm:h-10"
                            />
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="avgEnergyCost" className="text-white/90">Custo Médio de Energia (R$/mês)</Label>
                            <Input
                                id="avgEnergyCost"
                                name="avgEnergyCost"
                                type="number"
                                step="0.01"
                                value={formData.avgEnergyCost}
                                onChange={handleChange}
                                placeholder="Ex: 250.00"
                                className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 h-12 sm:h-10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="enelInvoiceFile" className="text-white/90">Conta de Energia ENEL (opcional)</Label>
                            <Input
                                id="enelInvoiceFile"
                                name="enelInvoiceFile"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleChange}
                                className="bg-white/20 backdrop-blur-sm border-white/30 text-white file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:font-medium h-12 sm:h-10"
                            />
                            <p className="text-white/60 text-sm mt-1">Envie uma foto ou PDF da sua última conta</p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat py-12 px-4 sm:px-6 lg:px-8 relative"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80&sat=-100')",
                }}>
                <div className="absolute inset-0 bg-black/40"></div>
                <Card className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm">
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
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat py-12 px-4 sm:px-6 lg:px-8 relative"
            style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80&sat=-100')",
            }}>
            <div className="absolute inset-0 bg-black/40"></div>

            <div className="max-w-2xl w-full space-y-6 sm:space-y-8 relative z-10">
                {/* Progress Bar */}
                <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/30">
                    <div className="flex items-center justify-between mb-8">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${currentStep > step.id
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-white/20 text-white/60'
                                    }`}>
                                    {currentStep > step.id ? (
                                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                    ) : (
                                        <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 rounded ${currentStep > step.id ? 'bg-green-500' : 'bg-white/20'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="text-center mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{steps[currentStep - 1].title}</h2>
                        <p className="text-white/90 text-sm sm:text-base">{steps[currentStep - 1].description}</p>
                        <p className="text-white/70 text-xs sm:text-sm mt-2">{steps[currentStep - 1].content}</p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-red-100 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Form Content */}
                    <div className="mb-8">
                        {renderStepContent()}
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="flex items-center justify-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 h-12 sm:h-10 text-base sm:text-sm"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
                            Anterior
                        </Button>

                        {currentStep < steps.length ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 h-12 sm:h-10 text-base sm:text-sm"
                            >
                                Próximo
                                <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 h-12 sm:h-10 text-base sm:text-sm"
                            >
                                {isLoading ? 'Cadastrando...' : 'Finalizar Cadastro'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Indication Code Display */}
                {indicationCode && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
                        <p className="text-white/90 text-sm">
                            🎉 Você foi indicado! Código: <span className="font-bold text-primary">{indicationCode}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}