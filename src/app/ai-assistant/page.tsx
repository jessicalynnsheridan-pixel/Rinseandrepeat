'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, ArrowLeft, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Write my Instagram bio',
  'Give me 10 content ideas for my brand',
  'How do I price my service?',
  'Write a cold DM script',
  'What should I post this week?',
  'Help me write a product description',
]



function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-ink-300"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export default function AIAssistantPage() {
  const { profile, signOut } = useUser()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: `Hi ${profile?.full_name ?? 'there'}. I'm your AI business assistant.\n\nAsk me anything — content ideas, pricing strategy, how to get your first client, what to post today. I'm here to help you build.`,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    const replyId = (Date.now() + 1).toString()

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessages(prev => [...prev, { id: replyId, role: 'assistant', content: err.error ?? 'Something went wrong. Try again.' }])
        setIsLoading(false)
        return
      }

      // Stream response
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let replyContent = ''
      setMessages(prev => [...prev, { id: replyId, role: 'assistant', content: '' }])
      setIsLoading(false)

      while (reader) {
        const { value, done } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n')
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const { text: chunk } = JSON.parse(data)
            if (chunk) {
              replyContent += chunk
              setMessages(prev => prev.map(m => m.id === replyId ? { ...m, content: replyContent } : m))
            }
          } catch { /* partial chunk */ }
        }
      }
    } catch {
      setMessages(prev => [...prev, { id: replyId, role: 'assistant', content: 'Connection error. Please try again.' }])
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <Sidebar profile={profile} onSignOut={signOut} />

      <div className="lg:pl-64 flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-ink-100 bg-white px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 rounded-lg border border-ink-100 flex items-center justify-center hover:bg-cream-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-ink-500" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ink-900 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">AI Business Assistant</p>
              <p className="text-xs text-ink-400">Powered by GPT-4</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs text-ink-400">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 max-w-3xl w-full mx-auto">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  msg.role === 'assistant' ? 'bg-ink-900' : 'bg-brand-500'
                )}>
                  {msg.role === 'assistant'
                    ? <Bot className="w-3.5 h-3.5 text-white" />
                    : <User className="w-3.5 h-3.5 text-white" />
                  }
                </div>

                {/* Bubble */}
                <div className={cn(
                  'max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'assistant'
                    ? 'bg-white border border-ink-100 text-ink-800'
                    : 'bg-ink-900 text-white'
                )}>
                  {msg.content.split('\n').map((line, i) => {
                    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    return line ? (
                      <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: bold }} />
                    ) : <br key={i} />
                  })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-7 h-7 rounded-full bg-ink-900 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-ink-100 rounded-2xl">
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions (only show when few messages) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3 max-w-3xl w-full mx-auto">
            <p className="text-xs text-ink-400 mb-2 px-1">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-white border border-ink-100 text-ink-600 rounded-lg hover:border-brand-500 hover:text-brand-500 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-ink-100 bg-white px-4 py-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <textarea
              className="flex-1 resize-none px-4 py-3 bg-cream-50 border border-ink-100 rounded-xl text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all max-h-32"
              placeholder="Ask anything about your business..."
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center flex-shrink-0 hover:bg-ink-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-center text-[10px] text-ink-300 mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
