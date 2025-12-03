'use client';

import { useEffect, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
                    subtitle='Tire suas dúvidas e resolva seus problemas'
                />
            }
        >
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : faqs.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    Nenhuma pergunta encontrada.
                </div>
            ) : (
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((item, index) => (
                        <AccordionItem key={item.id} value={`item-${index}`}>
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
        </PageLayout>
    );
}