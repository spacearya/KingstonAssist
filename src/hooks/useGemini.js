import { useState, useCallback } from 'react'

// HOOK_BACKEND_HERE: Replace with real @google/generative-ai when API key is configured.
// import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Placeholder hook for Gemini Pro integration.
 * Handles trip queries using local JSON data (restaurants, museums) when backend is connected.
 * @returns {{ ask: (prompt: string) => Promise<string>, isThinking: boolean, error: string | null }}
 */
export function useGemini() {
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState(null)

  const ask = useCallback(async (userPrompt) => {
    setIsThinking(true)
    setError(null)
    try {
      // HOOK_BACKEND_HERE: Uncomment and configure when Gemini API key is available.
      // const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY ?? '')
      // const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      // const result = await model.generateContent(buildSystemPrompt(userPrompt))
      // const response = await result.response
      // return response.text()

      // Simulated delay and response for demo
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))
      return `Based on your request: "${userPrompt}" — Kingston has great local restaurants, museums, and seasonal activities. Explore the Discovery tab for curated local produce and places to visit. (This is a placeholder; connect Gemini API for real suggestions.)`
    } catch (err) {
      const msg = err.message ?? 'Something went wrong.'
      setError(msg)
      return `Sorry, I couldn't process that. ${msg}`
    } finally {
      setIsThinking(false)
    }
  }, [])

  return { ask, isThinking, error }
}
