'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { Loader2, MessageCircle, HelpCircle, Search, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupportChat } from '@/frontend/support/components/support-chat';
import { filterFaqs, SUPPORT_WHATSAPP_MESSAGE, supportWhatsAppUrl } from '@/frontend/support/support-links';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category?: string;
}

export default function SupportPage() {
    const api = useAuthenticatedApi();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [query, setQuery] = useState('');
    const searchParams = useSearchParams();
    const whatsapp = supportWhatsAppUrl(SUPPORT_WHATSAPP_MESSAGE);
    const filtered = filterFaqs(faqs, query);

    useEffect(() => {
        const fetchFAQs = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/support/faqs');
                if (response.data.success) {
                    setFaqs(response.data.data);
                } else {
                    toast.error('Erro ao carregar FAQs');
                }
            } catch (error) {
                console.error('Error fetching FAQs:', error);
                toast.error('Erro ao carregar FAQs');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFAQs();
    }, []);

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Suporte"
                    subtitle='Tire suas dúvidas com nossa IA ou consulte as perguntas frequentes'
                />
            }
        >
            {whatsapp && (
                <div className="mb-6 flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-medium">Prefere falar com uma pessoa?</p>
                        <p className="text-sm text-muted-foreground">Nossa equipe atende pelo WhatsApp.</p>
                    </div>
                    <Button asChild>
                        <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                            <Phone className="h-4 w-4" /> Falar no WhatsApp
                        </a>
                    </Button>
                </div>
            )}

            <Tabs defaultValue={searchParams.get('tab') === 'faq' ? 'faq' : 'chat'} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="chat" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Chat com IA
                    </TabsTrigger>
                    <TabsTrigger value="faq" className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Perguntas Frequentes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="chat">
                    <SupportChat />
                </TabsContent>

                <TabsContent value="faq">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar nas perguntas frequentes"
                            aria-label="Buscar nas perguntas frequentes"
                            className="pl-9"
                        />
                    </div>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground" role="status">
                            <p>Nenhuma pergunta encontrada{query.trim() ? ` para “${query.trim()}”` : ''}.</p>
                            <p className="mt-1 text-sm">
                                Tente outras palavras, pergunte no Chat com IA
                                {whatsapp ? ' ou fale com a gente no WhatsApp' : ''}.
                            </p>
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {filtered.map((item) => (
                                <AccordionItem key={item.id} value={item.id}>
                                    <AccordionTrigger className="text-left">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </TabsContent>
            </Tabs>
        </PageLayout>
    );
}