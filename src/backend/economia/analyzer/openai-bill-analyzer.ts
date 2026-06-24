import OpenAI from 'openai'
import { AnalyzerError, BillAnalyzerProvider } from './types'

/* ------------------------------------------------------------------ */
/*  Config                                                              */
/* ------------------------------------------------------------------ */

const DEFAULT_MODEL = 'gpt-4o'

function getModel(): string {
  return process.env.BILL_ANALYZER_OPENAI_MODEL ?? DEFAULT_MODEL
}

/* ------------------------------------------------------------------ */
/*  Factory & implementation (best-effort stub)                         */
/* ------------------------------------------------------------------ */

export function createOpenAIBillAnalyzer(): BillAnalyzerProvider {
  // Construct the SDK client lazily so that simply selecting this
  // provider does not require a live OPENAI_API_KEY.
  let client: OpenAI | null = null

  function getClient(): OpenAI {
    if (!client) {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        throw new AnalyzerError(
          'OPENAI_API_KEY environment variable is not set',
        )
      }
      client = new OpenAI({ apiKey })
    }
    return client
  }

  return {
    name: 'openai',

    async extract() {
      throw new AnalyzerError(
        'OpenAI provider does not support bill extraction yet',
      )
    },

    async analyze() {
      throw new AnalyzerError(
        'OpenAI provider does not support bill analysis yet',
      )
    },

    async chat({ system, messages }) {
      const completion = await getClient().chat.completions.create({
        model: getModel(),
        stream: true,
        messages: [
          { role: 'system', content: system },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      })

      const encoder = new TextEncoder()
      return new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              const delta = chunk.choices[0]?.delta?.content
              if (delta) controller.enqueue(encoder.encode(delta))
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
