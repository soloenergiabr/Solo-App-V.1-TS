// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('framer-motion', () => ({
  motion: { div: 'div', path: 'path' },
}))

describe('ChatMessage', () => {
  it('renders user message', async () => {
    const { ChatMessage } = await import('@/frontend/economia/analysis/chat/chat-message')
    render(<ChatMessage role="user" content="Quanto economizei?" />)
    expect(screen.getByText('Quanto economizei?')).toBeDefined()
  })

  it('renders assistant message', async () => {
    const { ChatMessage } = await import('@/frontend/economia/analysis/chat/chat-message')
    render(<ChatMessage role="assistant" content="Você economizou R$ 85" />)
    expect(screen.getByText('Você economizou R$ 85')).toBeDefined()
  })

  it('shows streaming indicator', async () => {
    const { ChatMessage } = await import('@/frontend/economia/analysis/chat/chat-message')
    render(<ChatMessage role="assistant" content="" isStreaming />)
    expect(screen.getByText('…')).toBeDefined()
  })
})

describe('ChatInput', () => {
  it('renders input and send button', async () => {
    const { ChatInput } = await import('@/frontend/economia/analysis/chat/chat-input')
    render(<ChatInput onSend={() => {}} />)
    expect(screen.getByPlaceholderText(/Digite sua pergunta/)).toBeDefined()
  })

  it('calls onSend on submit', async () => {
    const onSend = vi.fn()
    const { ChatInput } = await import('@/frontend/economia/analysis/chat/chat-input')
    render(<ChatInput onSend={onSend} />)

    const input = screen.getByPlaceholderText(/Digite sua pergunta/)
    fireEvent.change(input, { target: { value: 'Quanto economizei?' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onSend).toHaveBeenCalledWith('Quanto economizei?')
  })

  it('shows loading spinner when disabled', async () => {
    const { ChatInput } = await import('@/frontend/economia/analysis/chat/chat-input')
    render(<ChatInput onSend={() => {}} disabled />)
    expect(screen.getByRole('button')).toBeDefined()
  })
})

describe('FAQSuggestions', () => {
  it('renders FAQ buttons', async () => {
    const { FAQSuggestions } = await import('@/frontend/economia/analysis/chat/faq-suggestions')
    render(<FAQSuggestions onSelect={() => {}} />)
    expect(screen.getByText('Quanto economizei este mês?')).toBeDefined()
    expect(screen.getByText('O que significa SCEE?')).toBeDefined()
  })

  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn()
    const { FAQSuggestions } = await import('@/frontend/economia/analysis/chat/faq-suggestions')
    render(<FAQSuggestions onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Quanto economizei este mês?'))
    expect(onSelect).toHaveBeenCalledWith('Quanto economizei este mês?')
  })
})
