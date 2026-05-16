'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, CreditCard, Shield, ChevronRight, Check } from 'lucide-react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'

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
  const { profile, signOut } = useUser()
  const [activeSection, setActiveSection] = useState<Section>('profile')
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_OPTIONS.map(o => [o.id, o.default]))
  )
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    business_name: '',
    business_type: '',
    email: '',
  })

  useEffect(() => {
    if (profile) {
      setProfileForm(prev => ({
        ...prev,
        full_name: profile.full_name ?? '',
        business_type: profile.business_type ?? '',
      }))
    }
  }, [profile])

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-8 md:px-8">

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-display font-semibold text-[#18181B] tracking-tight">Settings</h1>
            <p className="text-sm text-[#71717A] mt-1">Manage your account and preferences.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Nav */}
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
                      : 'text-[#71717A] hover:bg-[#EDE9FE] hover:text-[#18181B]'
                  )}
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </button>
              ))}
            </motion.div>

            {/* Content */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
              className="flex-1"
            >
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
                          onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                          className="input-field text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#71717A] block mb-1.5">Business Name</label>
                      <input
                        type="text"
                        value={profileForm.business_name}
                        onChange={e => setProfileForm(p => ({ ...p, business_name: e.target.value }))}
                        placeholder="Your business name"
                        className="input-field text-sm"
                      />
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
                    <button onClick={handleSave} className="btn-primary text-sm">
                      {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'notifications' && (
                <div className="card p-5">
                  <h2 className="text-sm font-semibold text-[#18181B] mb-4">Notification Preferences</h2>
                  <div className="space-y-3">
                    {NOTIFICATION_OPTIONS.map(opt => (
                      <div key={opt.id} className="flex items-start justify-between gap-4 py-2 border-b border-[#F4F4F5] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-[#18181B]">{opt.label}</p>
                          <p className="text-xs text-[#A1A1AA] mt-0.5">{opt.description}</p>
                        </div>
                        <button
                          onClick={() => setNotifications(p => ({ ...p, [opt.id]: !p[opt.id] }))}
                          className={cn(
                            'relative w-10 h-5.5 rounded-full transition-all duration-200 flex-shrink-0 mt-0.5',
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
                  <button onClick={handleSave} className="btn-primary text-sm mt-4">
                    {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save Preferences'}
                  </button>
                </div>
              )}

              {activeSection === 'billing' && (
                <div className="space-y-4">
                  <div className="card p-5">
                    <h2 className="text-sm font-semibold text-[#18181B] mb-1">Current Plan</h2>
                    <p className="text-xs text-[#A1A1AA] mb-4">You&apos;re on the Pro plan.</p>
                    <div className="flex items-center justify-between p-4 bg-[#EDE9FE] rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-[#7C3AED]">CEO Pro</p>
                        <p className="text-xs text-[#71717A]">$19 / month · Renews Jun 15</p>
                      </div>
                      <span className="badge-gold text-xs">Active</span>
                    </div>
                  </div>
                  <div className="card p-5">
                    <h2 className="text-sm font-semibold text-[#18181B] mb-4">Upgrade to CEO Elite</h2>
                    <p className="text-xs text-[#71717A] mb-4">Get unlimited AI chat, all roadmaps, and priority community access.</p>
                    <button className="btn-primary text-sm w-full">Upgrade — $49/mo</button>
                  </div>
                </div>
              )}

              {activeSection === 'account' && (
                <div className="space-y-4">
                  <div className="card p-5">
                    <h2 className="text-sm font-semibold text-[#18181B] mb-4">Password</h2>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-[#71717A] block mb-1.5">Current Password</label>
                        <input type="password" placeholder="••••••••" className="input-field text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-[#71717A] block mb-1.5">New Password</label>
                        <input type="password" placeholder="••••••••" className="input-field text-sm" />
                      </div>
                      <button onClick={handleSave} className="btn-primary text-sm">
                        {saved ? <><Check className="w-4 h-4" /> Updated</> : 'Update Password'}
                      </button>
                    </div>
                  </div>
                  <div className="card p-5 border border-[#FBEBEB]">
                    <h2 className="text-sm font-semibold text-[#D95B5B] mb-1">Danger Zone</h2>
                    <p className="text-xs text-[#A1A1AA] mb-4">Permanently delete your account and all data. This cannot be undone.</p>
                    <button className="text-sm font-medium text-[#D95B5B] border border-[#D95B5B] px-4 py-2 rounded-xl hover:bg-[#FBEBEB] transition-all">
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
