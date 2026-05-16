'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { Crown, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifyEmail, setVerifyEmail] = useState(false)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/auth/callback?next=/onboarding`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // If email confirmation is required
    if (data.user && !data.session) {
      setVerifyEmail(true)
      return
    }

    // Auto-confirmed (e.g. Supabase email confirmation disabled)
    router.push('/onboarding')
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

        {verifyEmail ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-[#EDE9FE] flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <h2 className="font-semibold text-[#18181B] mb-2">Check your inbox</h2>
            <p className="text-sm text-[#71717A]">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and start your CEO journey.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm text-[#7C3AED] font-medium hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#18181B] mb-1">Start your CEO era</h1>
            <p className="text-sm text-[#71717A] mb-8">Free account — no credit card needed</p>

            <form onSubmit={handleSignUp} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#52525B] mb-1.5">Your name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Jessica Smith"
                    required
                    className="input-field pl-10"
                  />
                </div>
              </div>

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
                <label className="block text-xs font-semibold text-[#52525B] mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
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
                {loading ? 'Creating account…' : 'Create free account'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-xs text-center text-[#A1A1AA]">
                By signing up you agree to our{' '}
                <Link href="#" className="underline">Terms</Link> and{' '}
                <Link href="#" className="underline">Privacy Policy</Link>
              </p>
            </form>

            <p className="mt-6 text-center text-sm text-[#71717A]">
              Already have an account?{' '}
              <Link href="/login" className="text-[#7C3AED] font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}
