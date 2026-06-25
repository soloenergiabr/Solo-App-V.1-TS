'use client'

import { Button } from '@/components/ui/button'

const FAQS = [
  'Quanto economizei este mês?',
  'Por que minha conta veio mais alta?',
  'O que significa SCEE?',
  'Meu sistema está gerando bem?',
  'O que é ICMS na conta de luz?',
  'Como funciona a compensação?',
]

interface FAQSuggestionsProps {
  onSelect: (question: string) => void
  disabled?: boolean
}

export function FAQSuggestions({ onSelect, disabled }: FAQSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-1.5 px-4 py-2">
      {FAQS.map((q) => (
        <Button
          key={q}
          variant="outline"
          size="sm"
          className="text-xs h-auto py-1.5 px-2.5"
          onClick={() => onSelect(q)}
          disabled={disabled}
        >
          {q}
        </Button>
      ))}
    </div>
  )
}
