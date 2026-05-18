import { OpenAI } from 'openai'
import { createRouteClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

// Lazy init - avoids Vercel build crash when OPENAI_API_KEY isn't set at build time
function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

const SYSTEM_PROMPT = `You are the AI Business Assistant inside "Rinse & Repeat CEO"  -  a business app for women entrepreneurs aged 18-35 who are building online businesses, brands, and creator businesses.

Your personality:
- Warm, direct, and empowering
- Speak like a brilliant big sister who runs a successful business
- Use clear, actionable advice  -  no fluff
- Celebrate wins and encourage consistency
- You know about: Shopify, digital products, content creation, affiliate marketing, med spa/wellness, service businesses, social media marketing, branding, email marketing, and general startup strategy

When giving advice:
- Always be specific and actionable
- Give examples relevant to online businesses
- Keep responses concise  -  2-4 paragraphs max
- Use bullet points for lists
- End with one clear next step

Never:
- Give legal or financial advice (refer them to professionals)
- Be overly formal or corporate
- Write walls of text without structure`

// Monthly query limits per plan
const QUERY_LIMITS: Record<string, number> = {
  free: 10,
  pro: 100,
  ceo: Infinity,
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and subscription tier
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, xp_points')
      .eq('id', user.id)
      .single()

    const tier = profile?.subscription_tier ?? 'free'
    const limit = QUERY_LIMITS[tier]

    // Count actual user messages sent this month across all conversations
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const { data: conversations } = await supabase
      .from('ai_conversations')
      .select('messages')
      .eq('user_id', user.id)
      .gte('created_at', monthStart.toISOString())

    // Sum user-role messages across all conversations this month
    const usedQueries = (conversations ?? []).reduce((sum, conv) => {
      const msgs = (conv.messages ?? []) as { role: string }[]
      return sum + msgs.filter(m => m.role === 'user').length
    }, 0)

    if (usedQueries >= limit) {
      return Response.json(
        { error: `Monthly query limit reached (${limit}). Upgrade to unlock more.` },
        { status: 429 }
      )
    }

    const { messages, conversationId } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Stream the response
    const stream = await getOpenAI().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      stream: true,
      max_tokens: 800,
      temperature: 0.7,
    })

    const encoder = new TextEncoder()
    let fullResponse = ''

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? ''
            if (text) {
              fullResponse += text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
            }
          }

          // Best-effort: save conversation (table may not exist yet  -  don't crash stream)
          try {
            const updatedMessages = [
              ...messages,
              { role: 'assistant', content: fullResponse, created_at: new Date().toISOString() },
            ]
            if (conversationId) {
              await supabase
                .from('ai_conversations')
                .update({ messages: updatedMessages })
                .eq('id', conversationId)
                .eq('user_id', user.id)
            } else {
              await supabase
                .from('ai_conversations')
                .insert({
                  user_id: user.id,
                  messages: updatedMessages,
                  title: messages[0]?.content?.slice(0, 50) ?? 'New conversation',
                })
            }
          } catch { /* table may not exist yet */ }

          // Best-effort: award XP
          try {
            await supabase.rpc('award_xp', { p_user_id: user.id, p_xp: 5 })
          } catch { /* rpc may not exist yet */ }

        } catch (streamErr) {
          console.error('Stream error:', streamErr)
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return Response.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
