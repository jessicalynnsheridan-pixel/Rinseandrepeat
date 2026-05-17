'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types'

interface UserContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function useUser() {
  return useContext(UserContext)
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = useMemo(() => createClientComponentClient(), [])

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // PGRST116 = no rows - profile may not exist yet (trigger delay)
        if (error.code !== 'PGRST116') {
          console.error('Profile fetch error:', error.message)
        }
        setProfile(null)
        return
      }

      if (data) setProfile(data as Profile)
    } catch (err) {
      console.error('Unexpected profile fetch error:', err)
      setProfile(null)
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      // Clear the onboarding cache cookie so the next user gets a fresh check
      if (typeof document !== 'undefined') {
        document.cookie = 'rrc_ob=; path=/; max-age=0; SameSite=Lax'
      }
      setUser(null)
      setProfile(null)
      router.push('/login')
    }
  }, [supabase, router])

  useEffect(() => {
    // Idempotent settle - once loading is cleared it stays cleared
    let settled = false
    function settle() {
      if (!settled) {
        settled = true
        setLoading(false)
      }
    }

    // 2-second absolute fallback - covers any edge case where the listener
    // never fires (private browsing, Safari ITP, network error)
    const safetyTimer = setTimeout(settle, 2000)

    // onAuthStateChange is the single source of truth for auth state.
    // Supabase v2 fires it immediately with INITIAL_SESSION from localStorage -
    // no need to also call getSession(), which would double the fetchProfile calls.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          // Settle loading as soon as we know the user is signed in.
          // Profile fetches in the background - the dashboard renders
          // with safe null fallbacks while it arrives.
          settle()
          fetchProfile(currentUser.id)
        } else {
          setProfile(null)
          settle()
        }
      }
    )

    return () => {
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  return (
    <UserContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </UserContext.Provider>
  )
}
