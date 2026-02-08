import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { useGemini } from '../hooks/useGemini'
import { useApp } from '../context/AppContext'
import { motion, AnimatePresence } from 'framer-motion'
import CertificationLeaves from './CertificationLeaves'

export default function ChatInterface() {
  const [input, setInput] = useState('')
  const { ask, isThinking } = useGemini()
  const { chatHistory, addChatMessage, clearChatHistory } = useApp()
  const bottomRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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

  const formatMessage = (text) => {
    if (!text) return null
    
    const lines = text.split('\n')
    const elements = []
    let currentSection = null
    let currentItem = null
    
    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      
      // Empty line - add spacing
      if (!trimmed) {
        if (elements.length > 0 && elements[elements.length - 1]?.type !== 'spacing') {
          elements.push({ type: 'spacing', key: `spacing-${idx}` })
        }
        return
      }
      
      // Section header (e.g., **CAFÉS**, **RESTAURANTS**)
      const sectionHeaderMatch = trimmed.match(/^\*\*([A-Z\s&]+)\*\*$/)
      if (sectionHeaderMatch) {
        currentSection = sectionHeaderMatch[1]
        elements.push({
          type: 'section-header',
          content: currentSection,
          key: `section-${idx}`
        })
        return
      }
      
      // Business/Place/Event name in bold (e.g., **Kingston Coffee House**)
      const boldNameMatch = trimmed.match(/^\*\*([^*]+)\*\*$/)
      if (boldNameMatch && !trimmed.includes('•')) {
        currentItem = boldNameMatch[1]
        elements.push({
          type: 'item-header',
          content: currentItem,
          key: `item-${idx}`
        })
        return
      }
      
      // Bullet point line (e.g., • Location: 1046 Princess St)
      if (trimmed.startsWith('•')) {
        const bulletContent = trimmed.substring(1).trim()
        const [label, ...valueParts] = bulletContent.split(':')
        const value = valueParts.join(':').trim()
        
        elements.push({
          type: 'bullet',
          label: label.trim(),
          value: value,
          key: `bullet-${idx}`
        })
        return
      }
      
      // Regular text line
      const processedLine = processInlineMarkdown(trimmed)
      elements.push({
        type: 'text',
        content: processedLine,
        key: `text-${idx}`
      })
    })
    
    return elements.map((el) => {
      switch (el.type) {
        case 'section-header':
          return (
            <div key={el.key} className="mt-4 mb-3 first:mt-0">
              <h3 className="text-base font-bold text-sage uppercase tracking-wide">
                {el.content}
              </h3>
            </div>
          )
        
        case 'item-header':
          return (
            <div key={el.key} className="mt-3 mb-2 first:mt-0">
              <h4 className="text-sm font-bold text-slate-deep">
                {el.content}
              </h4>
            </div>
          )
        
        case 'bullet':
          // Check if value is a URL
          const isUrl = el.value && (el.value.startsWith('http://') || el.value.startsWith('https://'))
          const isLocationLink = el.label.toLowerCase().includes('location') && isUrl
          
          // Check if this is a Green Plate Certification line
          const isCertification = el.label.toLowerCase().includes('green plate certification')
          const certValue = isCertification ? el.value : null
          
          return (
            <div key={el.key} className="ml-4 mb-1.5 flex items-start gap-2">
              <span className="text-sage mt-0.5">•</span>
              <div className="flex-1">
                <span className="font-medium text-slate-deep/90">{el.label}:</span>
                {el.value && (
                  isCertification ? (
                    <span className="ml-1 inline-flex items-center gap-1">
                      <CertificationLeaves certification={certValue} size="w-3.5 h-3.5" />
                      {certValue && certValue.toLowerCase() !== 'null' && (
                        <span className="text-slate-deep/70 text-xs">({certValue})</span>
                      )}
                    </span>
                  ) : isUrl ? (
                    <a
                      href={el.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sage hover:text-sage-light ml-1 underline font-medium transition-colors inline-flex items-center gap-1"
                    >
                      {isLocationLink ? 'Find Location' : el.value}
                    </a>
                  ) : (
                    <span className="text-slate-deep/70 ml-1">{el.value}</span>
                  )
                )}
              </div>
            </div>
          )
        
        case 'spacing':
          return <div key={el.key} className="h-2" />
        
        case 'text':
          return (
            <p key={el.key} className="text-sm text-slate-deep/80 leading-relaxed mb-1">
              {el.content}
            </p>
          )
        
        default:
          return null
      }
    })
  }
  
  const processInlineMarkdown = (text) => {
    // Process bold markdown (**text**)
    const parts = []
    let lastIndex = 0
    const boldRegex = /\*\*([^*]+)\*\*/g
    let match
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before bold
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }
      // Add bold text
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-deep">
          {match[1]}
        </strong>
      )
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }
    
    return parts.length > 0 ? parts : text
  }

  return (
    <div className="flex flex-col h-full max-h-[60vh] md:max-h-[500px] bg-gradient-to-b from-white/50 to-white/30 rounded-2xl overflow-hidden shadow-lg border border-white/20">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-white/20 bg-white/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage to-sage-light flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-deep">KingstonAI Assistant</h3>
            <p className="text-xs text-slate-deep/60">Your local travel guide</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        <AnimatePresence>
          {chatHistory.length === 0 && !isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sage/20 to-sage-light/20 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-sage" />
              </div>
              <p className="text-slate-deep/70 text-sm max-w-xs">
                Ask me about restaurants, places to visit, events, or plan your trip. I'll help you discover Kingston!
              </p>
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {['Best restaurants?', 'Places near water?', 'Upcoming events?'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-1.5 text-xs rounded-full bg-white/60 hover:bg-white/80 text-slate-deep border border-white/40 transition-all hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {chatHistory.map((msg, idx) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className={`flex gap-3 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-burnt-sienna to-burnt-sienna-light'
                  : 'bg-gradient-to-br from-sage to-sage-light'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Message Bubble */}
            <div
              className={`max-w-[80%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-sage to-sage-light text-white rounded-tr-sm'
                  : 'bg-white/90 text-slate-deep border border-white/40 rounded-tl-sm'
              }`}
            >
              <div className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white' : 'text-slate-deep'}`}>
                {formatMessage(msg.content)}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 items-start"
            >
              <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-sage to-sage-light flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/90 rounded-2xl rounded-tl-sm px-4 py-3 border border-white/40 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2 h-2 rounded-full bg-sage animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-sage animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-sage animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/20 bg-white/40 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about restaurants, places, events..."
            className="flex-1 rounded-xl border border-white/40 bg-white/80 px-4 py-3 text-sm text-slate-deep placeholder:text-slate-deep/50 focus:outline-none focus:ring-2 focus:ring-sage/50 focus:border-sage transition-all shadow-sm"
            disabled={isThinking}
            autoFocus
          />
          <button
            type="submit"
            disabled={isThinking || !input.trim()}
            className="shrink-0 p-3 rounded-xl bg-gradient-to-br from-sage to-sage-light text-white hover:from-sage-light hover:to-sage disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:hover:shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        {chatHistory.length > 0 && (
          <button
            type="button"
            onClick={clearChatHistory}
            className="mt-2 text-xs text-slate-deep/50 hover:text-slate-deep transition-colors"
          >
            Clear conversation
          </button>
        )}
      </div>
    </div>
  )
}
