'use client'


import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { Crown, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/dashboard'
  const supabase = createClientComponentClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [error, setError] = useState('')

  async function handleForgotPassword() {
    if (!email) { setError('Enter your email first'); return }
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/settings`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setResetSent(true)
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(redirect)
      router.refresh()
    }
  }

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    setError('')
    setMagicLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=${redirect}` },
    })
    setMagicLoading(false)
    if (error) setError(error.message)
    else setMagicSent(true)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-[#18181B] leading-none">Rinse & Repeat</span>
            <span className="block text-[10px] font-semibold text-[#7C3AED] uppercase tracking-widest leading-none mt-0.5">CEO</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#18181B] mb-1">Welcome back</h1>
        <p className="text-sm text-[#71717A] mb-8">Sign in to your CEO dashboard</p>

        {resetSent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-[#EDE9FE] flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <h2 className="font-semibold text-[#18181B] mb-2">Check your email</h2>
            <p className="text-sm text-[#71717A]">We sent a password reset link to <strong>{email}</strong>.</p>
            <button onClick={() => setResetSent(false)} className="mt-6 text-sm text-[#7C3AED] font-medium hover:underline">
              Back to sign in
            </button>
          </div>
        ) : magicSent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-[#EDE9FE] flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <h2 className="font-semibold text-[#18181B] mb-2">Check your email</h2>
            <p className="text-sm text-[#71717A]">We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
            <button
              onClick={() => setMagicSent(false)}
              className="mt-6 text-sm text-[#7C3AED] font-medium hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#52525B] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#52525B]">Password</label>
                <button type="button" onClick={handleForgotPassword} className="text-xs text-[#7C3AED] hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[#E4E4E7]" />
              <span className="text-xs text-[#A1A1AA]">or</span>
              <div className="flex-1 h-px bg-[#E4E4E7]" />
            </div>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={magicLoading}
              className="btn-outline w-full py-3"
            >
              <Mail className="w-4 h-4" />
              {magicLoading ? 'Sending…' : 'Email me a magic link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#71717A]">
          No account?{' '}
          <Link href="/signup" className="text-[#7C3AED] font-semibold hover:underline">
            Create one free
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
