import { GoogleGenerativeAI } from '@google/generative-ai'
import { cleanJsonText } from './parsers'
import { EXTRACTION_PROMPT, buildAnalysisPrompt } from './prompts'
import {
  AnalyzerError,
  BillAnalyzerProvider,
  RawBillData,
  SpecialistAnalysis,
} from './types'

/* ------------------------------------------------------------------ */
/*  Factory & implementation                                            */
/* ------------------------------------------------------------------ */

export function createGeminiBillAnalyzer(): BillAnalyzerProvider {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new AnalyzerError(
      'GEMINI_API_KEY environment variable is not set',
    )
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  return {
    name: 'gemini',

    async extract({ buffer, mimeType }) {
      const result = await model.generateContent([
        EXTRACTION_PROMPT,
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType,
          },
        },
      ])

      const text = result.response.text()

      try {
        const parsed = JSON.parse(cleanJsonText(text))
        return parsed as RawBillData
      } catch (err) {
        throw new AnalyzerError(
          'Failed to parse Gemini extraction response as JSON',
          err,
        )
      }
    },

    async analyze({ raw, flags }) {
      const prompt = buildAnalysisPrompt(raw, flags)
      const result = await model.generateContent([prompt])

      const text = result.response.text()

      try {
        const parsed = JSON.parse(cleanJsonText(text))
        return parsed as SpecialistAnalysis
      } catch (err) {
        throw new AnalyzerError(
          'Failed to parse Gemini analysis response as JSON',
          err,
        )
      }
    },

    async chat({ system, messages }) {
      const chatModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: system,
      })

      const contents = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

      const result = await chatModel.generateContentStream({ contents })

      const encoder = new TextEncoder()
      return new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const delta = chunk.text()
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
