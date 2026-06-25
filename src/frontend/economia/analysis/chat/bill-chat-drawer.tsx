'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { FAQSuggestions } from './faq-suggestions'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface BillChatDrawerProps {
  billId: string
  distributor?: string | null
  referenceMonth?: number
  referenceYear?: number
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function BillChatDrawer({ billId, distributor, referenceMonth, referenceYear }: BillChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const streamChat = useCallback(async (allMessages: Message[]) => {
    setIsLoading(true)
    let assistantContent = ''

    try {
      const resp = await fetch(`/api/economia/bills/${billId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      })

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ${resp.status}`)
      }

      if (!resp.body) throw new Error('Sem resposta do servidor')

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      const updateAssistant = (content: string) => {
        assistantContent = content
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastIdx = newMessages.length - 1
          if (newMessages[lastIdx]?.role === 'assistant') {
            newMessages[lastIdx] = { ...newMessages[lastIdx], content }
          }
          return newMessages
        })
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        updateAssistant(assistantContent + text)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.role === 'assistant' && !last.content) {
          return prev.slice(0, -1)
        }
        return prev
      })
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Erro ao processar resposta',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [billId])

  const handleSend = useCallback(
    (content: string) => {
      const userMessage: Message = { role: 'user', content }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      streamChat(newMessages)
    },
    [messages, streamChat],
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className="fixed bottom-6 right-6 h-14 px-5 shadow-lg z-50 gap-2 rounded-full"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Pergunte sobre sua conta</span>
          <span className="sm:hidden">Chat</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-left">Assistente Solo</SheetTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {distributor}
                {referenceMonth && ` • ${MONTH_NAMES[referenceMonth - 1]} ${referenceYear}`}
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="py-4">
            {messages.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-1">Olá! Sou o assistente Solo</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Posso responder qualquer dúvida sobre sua conta de energia.
                  Escolha uma pergunta frequente ou digite a sua:
                </p>
                <FAQSuggestions onSelect={handleSend} disabled={isLoading} />
              </div>
            ) : (
              messages.map((msg, idx) => (
                <ChatMessage
                  key={idx}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isLoading && idx === messages.length - 1 && msg.role === 'assistant'}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {messages.length > 0 && !isLoading && (
          <div className="border-t border-border bg-muted/30">
            <FAQSuggestions onSelect={handleSend} disabled={isLoading} />
          </div>
        )}

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </SheetContent>
    </Sheet>
  )
}
