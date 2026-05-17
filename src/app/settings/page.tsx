'use client'


import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, CreditCard, Shield, Check, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'

type Section = 'profile' | 'notifications' | 'billing' | 'account'

const SECTIONS = [
  { id: 'profile' as Section, label: 'Profile', icon: User },
  { id: 'notifications' as Section, label: 'Notifications', icon: Bell },
  { id: 'billing' as Section, label: 'Billing', icon: CreditCard },
  { id: 'account' as Section, label: 'Account', icon: Shield },
]

const NOTIFICATION_OPTIONS = [
  { id: 'daily_reminder', label: 'Daily habit reminder', description: 'Get a reminder to complete your habits', default: true },
  { id: 'streak_at_risk', label: 'Streak at risk', description: 'Alert when your streak is about to break', default: true },
  { id: 'weekly_summary', label: 'Weekly summary', description: 'Your progress recap every Sunday', default: true },
  { id: 'new_resources', label: 'New resources', description: 'When new templates and guides drop', default: false },
  { id: 'community', label: 'Community activity', description: 'Replies and reactions to your posts', default: false },
]

export default function SettingsPage() {
  const { profile, signOut, refreshProfile } = useUser()
  const supabase = createClientComponentClient()
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [saving, setSaving] = useState(false)
  const notifStorageKey = profile?.id ? `${profile.id}_notif_prefs_v1` : null

  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_OPTIONS.map(o => [o.id, o.default]))
  )
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    business_type: '',
    email: '',
  })
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)

  // Populate form once profile + user email is available
  useEffect(() => {
    const load = async () => {
      if (profile) {
        const { data: { user } } = await supabase.auth.getUser()
        setProfileForm(prev => ({
          ...prev,
          full_name: profile.full_name ?? '',
          business_type: profile.business_type ?? '',
          email: user?.email ?? '',
        }))

        // Load saved notification preferences from localStorage
        try {
          const key = `${profile.id}_notif_prefs_v1`
          const raw = localStorage.getItem(key)
          if (raw) {
            const saved = JSON.parse(raw)
            setNotifications(prev => ({ ...prev, ...saved }))
          }
        } catch { /* ignore */ }
      }
    }
    load()
  }, [profile, supabase])

  async function saveProfile() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileForm.full_name,
        business_type: profileForm.business_type || null,
      })
      .eq('id', profile.id)

    if (error) {
      toast.error('Failed to save  -  ' + error.message)
    } else {
      await refreshProfile()
      toast.success('Profile saved!')
    }
    setSaving(false)
  }

  async function updatePassword() {
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })
    setSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password updated!')
      setPasswordForm({ newPassword: '', confirm: '' })
    }
  }

  const tierLabel = profile?.subscription_tier === 'ceo' ? 'CEO Elite' :
    profile?.subscription_tier === 'pro' ? 'Founder Pro' : 'Free'
  const tierPrice = profile?.subscription_tier === 'ceo' ? '$49/mo' :
    profile?.subscription_tier === 'pro' ? '$19/mo' : 'Free'

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-8 md:px-8">

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-semibold text-[#18181B] tracking-tight">Settings</h1>
            <p className="text-sm text-[#71717A] mt-1">Manage your account and preferences.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Section nav */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 }}
              className="card p-2 md:w-48 flex-shrink-0 h-fit"
            >
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    activeSection === s.id
                      ? 'bg-[#EDE9FE] text-[#7C3AED]'
                      : 'text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#18181B]'
                  )}
                >
                  <s.icon className="w-4 h-4 flex-shrink-0" />
                  {s.label}
                </button>
              ))}
            </motion.div>

            {/* Content panel */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="flex-1 min-w-0"
            >

              {/* ── Profile ── */}
              {activeSection === 'profile' && (
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-[#18181B] mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-[#71717A] block mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.full_name}
                          onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                          className="input-field text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#71717A] block mb-1.5">Email</label>
                        <input
                          type="email"
                          value={profileForm.email}
                          disabled
                          className="input-field text-sm opacity-60 cursor-not-allowed"
                        />
                        <p className="text-[10px] text-[#A1A1AA] mt-1">Email changes require re-verification</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#71717A] block mb-1.5">Business Type</label>
                      <select
                        value={profileForm.business_type}
                        onChange={e => setProfileForm(p => ({ ...p, business_type: e.target.value }))}
                        className="input-field text-sm"
                      >
                        <option value="">Select type...</option>
                        <option value="shopify">Shopify / E-commerce</option>
                        <option value="digital">Digital Products</option>
                        <option value="creator">Content Creator</option>
                        <option value="service">Service Business</option>
                        <option value="affiliate">Affiliate Marketing</option>
                        <option value="medspa">Med Spa / Beauty</option>
                      </select>
                    </div>
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="btn-primary text-sm"
                    >
                      {saving ? 'Saving…' : <><Check className="w-4 h-4" /> Save Changes</>}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Notifications ── */}
              {activeSection === 'notifications' && (
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-[#18181B] mb-4">Notification Preferences</h2>
                  <div className="space-y-1">
                    {NOTIFICATION_OPTIONS.map(opt => (
                      <div key={opt.id} className="flex items-start justify-between gap-4 py-3 border-b border-[#F4F4F5] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-[#18181B]">{opt.label}</p>
                          <p className="text-xs text-[#A1A1AA] mt-0.5">{opt.description}</p>
                        </div>
                        <button
                          onClick={() => setNotifications(p => ({ ...p, [opt.id]: !p[opt.id] }))}
                          className={cn(
                            'relative w-10 rounded-full flex-shrink-0 mt-0.5 transition-colors duration-200',
                            notifications[opt.id] ? 'bg-[#7C3AED]' : 'bg-[#E4E4E7]'
                          )}
                          style={{ height: '22px' }}
                        >
                          <span className={cn(
                            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
                            notifications[opt.id] ? 'left-[22px]' : 'left-0.5'
                          )} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      try {
                        if (notifStorageKey) {
                          localStorage.setItem(notifStorageKey, JSON.stringify(notifications))
                        }
                        toast.success('Preferences saved!')
                      } catch {
                        toast.error('Could not save preferences')
                      }
                    }}
                    className="btn-primary text-sm mt-4"
                  >
                    Save Preferences
                  </button>
                </div>
              )}

              {/* ── Billing ── */}
              {activeSection === 'billing' && (
                <div className="space-y-4">
                  <div className="card p-5">
                    <h2 className="text-sm font-semibold text-[#18181B] mb-3">Current Plan</h2>
                    <div className="flex items-center justify-between p-4 bg-[#EDE9FE] rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-[#7C3AED]">{tierLabel}</p>
                        <p className="text-xs text-[#71717A]">{tierPrice}</p>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-semibold bg-[#7C3AED] text-white rounded-full">Active</span>
                    </div>
                  </div>
                  {profile?.subscription_tier !== 'ceo' && (
                    <div className="card p-5">
                      <h2 className="text-sm font-semibold text-[#18181B] mb-2">
                        {profile?.subscription_tier === 'free' ? 'Upgrade to Founder Pro' : 'Upgrade to CEO Elite'}
                      </h2>
                      <p className="text-xs text-[#71717A] mb-4">Unlock all roadmaps, unlimited AI, and the full resource vault.</p>
                      <button className="btn-primary text-sm w-full">
                        {profile?.subscription_tier === 'free' ? 'Upgrade  -  $19/mo' : 'Upgrade  -  $49/mo'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Account / Security ── */}
              {activeSection === 'account' && (
                <div className="space-y-4">
                  <div className="card p-5">
                    <h2 className="text-sm font-semibold text-[#18181B] mb-4">Change Password</h2>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-[#71717A] block mb-1.5">New Password</label>
                        <div className="relative">
                          <input
                            type={showPw ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                            placeholder="Min 8 characters"
                            className="input-field text-sm pr-10"
                          />
                          <button type="button" onClick={() => setShowPw(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#71717A] block mb-1.5">Confirm New Password</label>
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={passwordForm.confirm}
                          onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                          placeholder="••••••••"
                          className="input-field text-sm"
                        />
                      </div>
                      <button
                        onClick={updatePassword}
                        disabled={saving}
                        className="btn-primary text-sm"
                      >
                        {saving ? 'Updating…' : 'Update Password'}
                      </button>
                    </div>
                  </div>

                  <div className="card p-5 border-[#FEE2E2]">
                    <h2 className="text-sm font-semibold text-[#DC2626] mb-1">Danger Zone</h2>
                    <p className="text-xs text-[#A1A1AA] mb-4">Permanently delete your account and all data. This cannot be undone.</p>
                    <button
                      onClick={() => {
                        if (confirm('Are you absolutely sure? This will permanently delete your account.')) {
                          toast.error('Please contact support to delete your account.')
                        }
                      }}
                      className="text-sm font-medium text-[#DC2626] border border-[#DC2626] px-4 py-2 rounded-xl hover:bg-[#FEE2E2] transition-all"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
