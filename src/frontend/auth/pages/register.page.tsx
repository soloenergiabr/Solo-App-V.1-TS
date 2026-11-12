'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthContext } from '@/frontend/auth/contexts/auth-context';
import { registerSchema, type RegisterValues } from '@/frontend/auth/validation';
import { supportWhatsAppUrl } from '@/frontend/support/support-links';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        mode: 'onTouched',
        defaultValues: { name: '', email: '', cpfCnpj: '', phone: '', address: '', avgEnergyCost: '' },
    });
    const { isSubmitting, isValid } = form.formState;
    const [enelInvoiceFile, setEnelInvoiceFile] = useState<File | null>(null);
    const avgEnergyCost = form.watch('avgEnergyCost');
    const missingEnergyInfo = !avgEnergyCost && !enelInvoiceFile;
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

    const onSubmit = async (values: RegisterValues) => {
        setError('');
        setSuccess('');

        if (!values.avgEnergyCost && !enelInvoiceFile) {
            setError('Você deve fornecer a média de custo de energia ou o arquivo da conta ENEL.');
            return;
        }

        try {
            let enelInvoiceFileBase64: string | undefined;
            if (enelInvoiceFile) {
                enelInvoiceFileBase64 = await fileToBase64(enelInvoiceFile);
            }

            const result = await register({
                name: values.name,
                email: values.email,
                cpfCnpj: values.cpfCnpj,
                phone: values.phone || undefined,
                address: values.address || undefined,
                avgEnergyCost: values.avgEnergyCost ? parseFloat(values.avgEnergyCost) : undefined,
                enelInvoiceFile: enelInvoiceFileBase64,
                indicationCode: indicationCode || undefined,
            });

            if (result.success) {
                setSuccess(result.message || 'Cadastro realizado com sucesso!');
            } else {
                setError(result.error || 'Erro no cadastro');
            }
        } catch {
            setError('Erro inesperado');
        }
    };

    const whatsapp = supportWhatsAppUrl('Olá! Tenho dúvidas sobre o cadastro na Solo Energy.');

    const textField = (
        name: keyof RegisterValues,
        label: string,
        props: React.ComponentProps<typeof Input>,
    ) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-foreground">{label}</FormLabel>
                    <FormControl>
                        <Input className="h-12 sm:h-10" {...props} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="text-left space-y-6">
                        <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                            <Sun className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 text-left">Energia Solar Inteligente</h3>
                            <p className="text-foreground text-base sm:text-lg leading-relaxed text-left">
                                Transforme sua energia solar em economia real. Monitore sua produção,
                                otimize seu consumo e maximize seus ganhos com tecnologia de ponta.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                <p className="text-foreground text-sm text-center">Monitoramento em Tempo Real</p>
                            </div>
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                <p className="text-foreground text-sm text-center">Economia Garantida</p>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="text-left space-y-4">
                        {textField('name', 'Nome Completo', { type: 'text', autoComplete: 'name', placeholder: 'Seu nome completo' })}
                        {textField('email', 'Email', { type: 'email', autoComplete: 'email', placeholder: 'seu@email.com' })}
                        {textField('cpfCnpj', 'CPF/CNPJ', { type: 'text', inputMode: 'numeric', placeholder: 'CPF ou CNPJ' })}
                    </div>
                );
            case 3:
                return (
                    <div className="text-left space-y-4">
                        {textField('phone', 'Telefone', { type: 'tel', autoComplete: 'tel', placeholder: '(11) 99999-9999' })}
                        {textField('address', 'Endereço', { type: 'text', autoComplete: 'street-address', placeholder: 'Rua, número, bairro, cidade' })}
                    </div>
                );
            case 4:
                return (
                    <div className="text-left space-y-4">
                        {textField('avgEnergyCost', 'Custo Médio de Energia (R$/mês)', { type: 'number', step: '0.01', min: '0', placeholder: 'Ex: 250.00' })}
                        <div>
                            <Label htmlFor="enelInvoiceFile" className="text-foreground">Conta de Energia ENEL (opcional)</Label>
                            <Input
                                id="enelInvoiceFile"
                                name="enelInvoiceFile"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setEnelInvoiceFile(e.target.files?.[0] ?? null)}
                                className="file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:font-medium h-12 sm:h-10"
                            />
                            <p className="text-muted-foreground text-sm mt-1">Envie uma foto ou PDF da sua última conta</p>
                            {missingEnergyInfo && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Informe o custo médio ou envie a conta para finalizar.
                                </p>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (success) {
        return (
            <div className="mx-auto w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-center text-success">Cadastro concluído!</CardTitle>
                        <CardDescription className="text-center">{success}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            Em breve nossa equipe entrará em contato para análise do seu perfil.
                        </p>
                        {whatsapp && (
                            <Button asChild className="w-full">
                                <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                                    Entrar em contato pelo WhatsApp
                                </a>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${currentStep > step.id
                                        ? 'bg-success text-white'
                                        : currentStep === step.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {currentStep > step.id ? (
                                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                                    ) : (
                                        <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 rounded ${currentStep > step.id ? 'bg-success' : 'bg-muted'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="text-left mb-6 sm:mb-8">
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">{steps[currentStep - 1].title}</h2>
                        <p className="text-muted-foreground text-sm sm:text-base">{steps[currentStep - 1].description}</p>
                        <p className="text-muted-foreground/70 text-xs sm:text-sm mt-2">{steps[currentStep - 1].content}</p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Form Content */}
                    <Form {...form}>
                        <div className="mb-8">
                            {renderStepContent()}
                        </div>
                    </Form>

                    {/* Navigation */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="flex items-center justify-center gap-2 h-12 sm:h-10 text-base sm:text-sm"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-4 sm:h-4" />
                            Anterior
                        </Button>

                        {currentStep < steps.length ? (
                            <Button
                                type="button"
                                onClick={nextStep}
                                disabled={currentStep === 2 && !isValid}
                                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 h-12 sm:h-10 text-base sm:text-sm"
                            >
                                Próximo
                                <ChevronRight className="w-5 h-5 sm:w-4 sm:h-4" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isSubmitting || !isValid || missingEnergyInfo}
                                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 h-12 sm:h-10 text-base sm:text-sm"
                            >
                                {isSubmitting ? 'Cadastrando...' : 'Finalizar Cadastro'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Indication Code Display */}
                {indicationCode && (
                    <div className="rounded-2xl border bg-card p-4 text-center">
                        <p className="text-sm text-foreground">
                            Você foi indicado! Código: <span className="font-bold text-primary">{indicationCode}</span>
                        </p>
                    </div>
                )}
        </div>
    );
}