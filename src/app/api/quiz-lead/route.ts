import { createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, archetype } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from('quiz_leads').upsert(
      {
        email: email.trim().toLowerCase(),
        archetype: archetype ?? 'unknown',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )

    if (error) {
      // Table may not exist yet - return success anyway so the funnel still works
      console.error('quiz_leads insert error:', error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('quiz-lead route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
