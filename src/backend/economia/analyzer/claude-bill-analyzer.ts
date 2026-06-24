import Anthropic from '@anthropic-ai/sdk'
import { cleanJsonText } from './parsers'
import { EXTRACTION_PROMPT, buildAnalysisPrompt } from './prompts'
import {
  AnalyzerError,
  BillAnalyzerProvider,
  RawBillData,
  SpecialistAnalysis,
} from './types'

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const DEFAULT_MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 8192

function getModel(): string {
  return process.env.BILL_ANALYZER_CLAUDE_MODEL ?? DEFAULT_MODEL
}

/* ------------------------------------------------------------------ */
/*  Factory & implementation                                            */
/* ------------------------------------------------------------------ */

export function createClaudeBillAnalyzer(): BillAnalyzerProvider {
  // Construct the SDK client lazily so that simply selecting this
  // provider does not require a live ANTHROPIC_API_KEY.
  let client: Anthropic | null = null

  function getClient(): Anthropic {
    if (!client) {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        throw new AnalyzerError(
          'ANTHROPIC_API_KEY environment variable is not set',
        )
      }
      client = new Anthropic({ apiKey })
    }
    return client
  }

  function extractText(content: Anthropic.ContentBlock[]): string {
    return content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
  }

  return {
    name: 'claude',

    async extract({ buffer, mimeType }) {
      const data = buffer.toString('base64')
      const source =
        mimeType === 'application/pdf'
          ? {
              type: 'document' as const,
              source: {
                type: 'base64' as const,
                media_type: 'application/pdf' as const,
                data,
              },
            }
          : {
              type: 'image' as const,
              source: {
                type: 'base64' as const,
                media_type: mimeType as
                  | 'image/jpeg'
                  | 'image/png'
                  | 'image/gif'
                  | 'image/webp',
                data,
              },
            }

      const response = await getClient().messages.create({
        model: getModel(),
        max_tokens: MAX_TOKENS,
        messages: [
          {
            role: 'user',
            content: [source, { type: 'text', text: EXTRACTION_PROMPT }],
          },
        ],
      })

      const text = extractText(response.content)

      try {
        const parsed = JSON.parse(cleanJsonText(text))
        return parsed as RawBillData
      } catch (err) {
        throw new AnalyzerError(
          'Failed to parse Claude extraction response as JSON',
          err,
        )
      }
    },

    async analyze({ raw, flags }) {
      const prompt = buildAnalysisPrompt(raw, flags)

      const response = await getClient().messages.create({
        model: getModel(),
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = extractText(response.content)

      try {
        const parsed = JSON.parse(cleanJsonText(text))
        return parsed as SpecialistAnalysis
      } catch (err) {
        throw new AnalyzerError(
          'Failed to parse Claude analysis response as JSON',
          err,
        )
      }
    },

    async chat({ system, messages }) {
      const stream = getClient().messages.stream({
        model: getModel(),
        max_tokens: MAX_TOKENS,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      })

      const encoder = new TextEncoder()
      return new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (
                event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta'
              ) {
                controller.enqueue(encoder.encode(event.delta.text))
              }
            }
            controller.close()
          } catch (err) {
            controller.error(err)
          }
        },
      })
    },
  }
}
