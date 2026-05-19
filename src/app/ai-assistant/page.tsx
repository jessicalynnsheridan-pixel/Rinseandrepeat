'use client'


import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, ArrowLeft } from 'lucide-react'
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
          className="w-1.5 h-1.5 rounded-full bg-[#D4D4D8]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

// Safe markdown-ish renderer  -  no dangerouslySetInnerHTML
function MessageLine({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return (
    <p className="mb-1 last:mb-0">
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : <span key={i}>{part}</span>
      )}
    </p>
  )
}

const TIER_LIMITS: Record<string, number> = { free: 10, pro: 100, ceo: Infinity }

const ROADMAP_NAMES: Record<string, string> = {
  shopify:   'Shopify Brand',
  digital:   'Digital Products',
  creator:   'Content Creator',
  service:   'Service Business',
  affiliate: 'Affiliate Marketing',
  medspa:    'Med Spa / Wellness',
}

export default function AIAssistantPage() {
  const { profile, signOut, user } = useUser()
  const router = useRouter()

  const [roadmapContext, setRoadmapContext] = useState<string | null>(null)

  const greeting = `Hi ${profile?.full_name ?? 'there'}! I'm your AI business assistant.\n\nAsk me anything  -  content ideas, pricing strategy, how to get your first client, what to post today. I'm here to help you build.`

  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', content: greeting },
  ])
  const [input, setInput] = useState('')

  // Read prefill from guide page
  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem('ai_prefill')
      if (prefill) {
        sessionStorage.removeItem('ai_prefill')
        setInput(prefill)
      }
    } catch { /* private mode */ }
  }, [])

  const [isLoading, setIsLoading] = useState(false)
  const [queriesUsed, setQueriesUsed] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load roadmap context from localStorage
  useEffect(() => {
    if (!user?.id || !profile?.selected_roadmap) return
    try {
      const slug = profile.selected_roadmap
      const raw = localStorage.getItem(`${user.id}_roadmap_${slug}_v1`)
      if (raw) {
        const progress = JSON.parse(raw)
        const stepsCompleted = (progress.completedIds ?? []).length
        setRoadmapContext(`${ROADMAP_NAMES[slug] ?? slug} roadmap, Step ${stepsCompleted + 1}`)
      }
    } catch {}
  }, [user?.id, profile?.selected_roadmap])

  // Update greeting once profile loads (profile is null on first render)
  useEffect(() => {
    if (profile?.full_name) {
      const name = profile.full_name
      const contextGreeting = roadmapContext
        ? `Hi ${name}! I'm your AI business assistant — and I can see you're working on your ${roadmapContext}. Ask me anything about your next steps, content ideas, pricing, or anything else. I'm here to help you build.`
        : `Hi ${name}! I'm your AI business assistant.\n\nAsk me anything  -  content ideas, pricing strategy, how to get your first client, what to post today. I'm here to help you build.`
      setMessages(prev =>
        prev.map(m =>
          m.id === '0'
            ? { ...m, content: contextGreeting }
            : m
        )
      )
    }
  }, [profile?.full_name, roadmapContext])

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
          roadmapContext,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const isLimit = res.status === 429
        const errMsg = isLimit
          ? `You've used all your queries for this month. Upgrade to get more. → /pricing`
          : (err.error ?? 'Something went wrong. Try again.')
        setMessages(prev => [...prev, { id: replyId, role: 'assistant', content: errMsg }])
        setIsLoading(false)
        return
      }
      // Count successful sends
      setQueriesUsed(n => n + 1)

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
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <div className="lg:pl-64 flex flex-col h-screen">
        {/* Header */}
        <div className="border-b border-[#E4E4E7] bg-white px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 rounded-lg border border-[#E4E4E7] flex items-center justify-center hover:bg-[#F4F4F5] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#71717A]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#18181B]">AI Business Assistant</p>
              <p className="text-xs text-[#A1A1AA]">Powered by GPT-4o</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {/* Quota indicator */}
            {profile?.subscription_tier && profile.subscription_tier !== 'ceo' && (
              <span className="text-[10px] text-[#A1A1AA] hidden sm:block">
                {queriesUsed}/{TIER_LIMITS[profile.subscription_tier ?? 'free']} queries
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span className="text-xs text-[#A1A1AA]">Online</span>
            </div>
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
                  msg.role === 'assistant' ? 'bg-[#7C3AED]' : 'bg-[#18181B]'
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
                    ? 'bg-white border border-[#E4E4E7] text-[#3F3F46]'
                    : 'bg-[#18181B] text-white'
                )}>
                  {msg.content.split('\n').map((line, i) =>
                    line ? <MessageLine key={i} text={line} /> : <br key={i} />
                  )}
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
              <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-[#E4E4E7] rounded-2xl">
                <TypingIndicator />
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions (only show when no user messages yet) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-3 max-w-3xl w-full mx-auto">
            <p className="text-xs text-[#A1A1AA] mb-2 px-1">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 bg-white border border-[#E4E4E7] text-[#71717A] rounded-lg hover:border-[#7C3AED] hover:text-[#7C3AED] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-[#E4E4E7] bg-white px-4 py-4 flex-shrink-0 pb-20 lg:pb-4">
          <div className="max-w-3xl mx-auto flex items-end gap-3">
            <textarea
              className="flex-1 resize-none px-4 py-3 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 transition-all max-h-32"
              placeholder="Ask anything about your business..."
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center flex-shrink-0 hover:bg-[#5B21B6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
          <p className="text-center text-[10px] text-[#A1A1AA] mt-2">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
      <MobileNav />
    </div>
  )
}
