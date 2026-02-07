import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { useGemini } from '../hooks/useGemini'
import { useApp } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatInterface() {
  const [input, setInput] = useState('')
  const { ask, isThinking } = useGemini()
  const { chatHistory, addChatMessage, clearChatHistory } = useApp()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isThinking])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isThinking) return
    setInput('')
    addChatMessage('user', trimmed)
    const reply = await ask(trimmed)
    addChatMessage('assistant', reply)
  }

  return (
    <div className="flex flex-col h-full max-h-[60vh] md:max-h-[480px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-[var(--radius-2xl)] bg-white/40">
        {chatHistory.length === 0 && !isThinking && (
          <p className="text-slate-deep/70 text-sm text-center py-4">
            Ask for a 3-day trip, local restaurants, or things to do — I'll use Kingston data to help.
          </p>
        )}
        {chatHistory.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
          >
            {msg.role === 'assistant' && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-sage" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-[var(--radius-xl)] px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-sage text-white'
                  : 'bg-white/80 text-slate-deep border border-[var(--color-glass-border)]'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="shrink-0 w-8 h-8 rounded-full bg-burnt-sienna/20 flex items-center justify-center">
                <User className="w-4 h-4 text-burnt-sienna" />
              </div>
            )}
          </motion.div>
        ))}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 items-center text-slate-deep/70"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-sage/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-sage" />
              </div>
              <span className="text-sm animate-pulse">typing...</span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 3-day trip with my girlfriend"
          className="flex-1 rounded-[var(--radius-xl)] border border-[var(--color-glass-border)] bg-white/80 px-4 py-3 text-slate-deep placeholder:text-slate-deep/50 focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage transition-all"
          disabled={isThinking}
        />
        <button
          type="submit"
          disabled={isThinking || !input.trim()}
          className="shrink-0 p-3 rounded-[var(--radius-xl)] bg-sage text-white hover:bg-sage-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
      {chatHistory.length > 0 && (
        <button
          type="button"
          onClick={clearChatHistory}
          className="mt-2 text-xs text-slate-deep/60 hover:text-slate-deep"
        >
          Clear chat
        </button>
      )}
    </div>
  )
}
