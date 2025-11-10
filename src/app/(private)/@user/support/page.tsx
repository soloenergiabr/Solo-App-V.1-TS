import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";

const faqItems = [
    {
        question: "Qual é o valor do produto?",
        answer: "O valor do produto é de R$ 100,00."
    },
    {
        question: "Como posso fazer o pagamento?",
        answer: "Você pode fazer o pagamento pelo boleto ou cartão de crédito."
    },
    {
        question: "Qual é o prazo de entrega?",
        answer: "O prazo de entrega é de 5 dias úteis."
    }
]

export default function SupportPage() {
    return (
        <PageLayout
            header={
                <PageHeader
                    title="Suporte"
                    subtitle='Tire suas dúvidas e resolva seus problemas'
                />
            }
        >
            <Accordion type="single" collapsible>
                {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>
                            {item.question}
                        </AccordionTrigger>
                        <AccordionContent>
                            {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </PageLayout>
    );
}