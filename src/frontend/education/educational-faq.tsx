'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useAuthenticatedApi } from '@/frontend/auth/hooks/useAuthenticatedApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '@/components/ui/collapsible'

type Faq = {
    id?: string
    question: string
    answer: string
    category: string
}

type Props = {
    category: string
    title?: string
}

export function EducationalFaq({
    category,
    title = 'Entenda sua conta de energia',
}: Props) {
    const api = useAuthenticatedApi()
    const [faqs, setFaqs] = useState<Faq[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setIsLoading(true)
        setError(null)

        api
            .get<{ success: boolean; data: Faq[] }>(
                '/support/faqs?category=' + category,
            )
            .then((res) => {
                if (!cancelled) {
                    setFaqs(res.data.data ?? [])
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    const message =
                        err instanceof Error ? err.message : 'Erro ao carregar FAQs'
                    setError(message)
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category])

    if (isLoading) {
        return (
            <div className="space-y-2 pt-4" data-testid="educational-faq-loading">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
        )
    }

    // On error or no FAQs: render nothing — never break the host screen
    if (error || faqs.length === 0) return null

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {faqs.map((faq, i) => (
                    <Collapsible key={faq.id ?? i}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-left text-sm font-medium hover:underline">
                            <span>{faq.question}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="text-sm text-muted-foreground pb-3">
                            {faq.answer}
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </CardContent>
        </Card>
    )
}
