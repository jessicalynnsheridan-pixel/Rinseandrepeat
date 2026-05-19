'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Plus, Send, X, Loader2 } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Post {
  id: string
  user_id: string
  content: string
  post_type: string
  likes_count: number
  comments_count: number
  created_at: string
  liked: boolean
  author: string
  authorLevel: string
  initials: string
  color: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  '#7C3AED', '#16A34A', '#E5974A', '#C89070',
  '#D95B5B', '#0EA5E9', '#A1A1AA', '#854D0E',
]

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  win:            { label: 'Win',           color: '#16A34A', bg: '#DCFCE7' },
  tip:            { label: 'Tip',           color: '#E5974A', bg: '#FDF3EA' },
  question:       { label: 'Question',      color: '#7C3AED', bg: '#EDE9FE' },
  resource:       { label: 'Resource',      color: '#A1A1AA', bg: '#FAFAFA' },
  update:         { label: 'Update',        color: '#0EA5E9', bg: '#E0F2FE' },
  accountability: { label: 'Accountability',color: '#D95B5B', bg: '#FEE2E2' },
}

const FILTER_TABS = [
  { id: 'all',            label: 'All Posts' },
  { id: 'win',            label: 'Wins' },
  { id: 'question',       label: 'Questions' },
  { id: 'accountability', label: 'Accountability' },
  { id: 'update',         label: 'Updates' },
]

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function colorForId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const { profile, user, signOut } = useUser()
  const [posts, setPosts] = useState<Post[]>([])
  const [filter, setFilter] = useState('all')
  const [showCompose, setShowCompose] = useState(false)
  const [newPost, setNewPost] = useState({ content: '', post_type: 'win' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClientComponentClient()

  // ─── Prefill from roadmap share prompt ────────────────────────────────────

  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem('community_prefill')
      if (prefill) {
        sessionStorage.removeItem('community_prefill')
        setNewPost({ content: prefill, post_type: 'win' })
        setShowCompose(true)
      }
    } catch { /* private mode */ }
  }, [])

  // ─── Fetch posts ───────────────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch posts with author profile in one query
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          id, user_id, content, post_type, likes_count, comments_count, created_at,
          profiles!community_posts_user_id_fkey (full_name, level)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // Fetch which posts the current user has liked
      let likedSet = new Set<string>()
      if (user?.id) {
        const { data: reactions } = await supabase
          .from('community_reactions')
          .select('post_id')
          .eq('user_id', user.id)
          .eq('reaction_type', 'like')
        if (reactions) likedSet = new Set(reactions.map(r => r.post_id))
      }

      const mapped: Post[] = (data ?? []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        content: p.content,
        post_type: p.post_type,
        likes_count: p.likes_count ?? 0,
        comments_count: p.comments_count ?? 0,
        created_at: p.created_at,
        liked: likedSet.has(p.id),
        author: p.profiles?.full_name ?? 'Member',
        authorLevel: p.profiles?.level ?? 'Founder',
        initials: getInitials(p.profiles?.full_name ?? 'M'),
        color: colorForId(p.user_id),
      }))

      setPosts(mapped)
    } catch (err) {
      console.error('Failed to load community posts:', err)
    } finally {
      setLoading(false)
    }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchPosts() }, [fetchPosts])

  // ─── Toggle like ───────────────────────────────────────────────────────────

  async function toggleLike(postId: string) {
    if (!user?.id) return

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 }
        : p
    ))

    try {
      await supabase.rpc('toggle_post_like', {
        p_post_id: postId,
        p_user_id: user.id,
      })
    } catch (err) {
      console.error('Like failed:', err)
      // Revert on error
      setPosts(prev => prev.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes_count: p.liked ? p.likes_count - 1 : p.likes_count + 1 }
          : p
      ))
    }
  }

  // ─── Submit post ───────────────────────────────────────────────────────────

  async function submitPost() {
    if (!newPost.content.trim() || !user?.id || submitting) return
    setSubmitting(true)

    try {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content: newPost.content.trim(),
          post_type: newPost.post_type,
        })
        .select(`
          id, user_id, content, post_type, likes_count, comments_count, created_at,
          profiles!community_posts_user_id_fkey (full_name, level)
        `)
        .single()

      if (error) throw error

      const newEntry: Post = {
        id: data.id,
        user_id: data.user_id,
        content: data.content,
        post_type: data.post_type,
        likes_count: 0,
        comments_count: 0,
        created_at: data.created_at,
        liked: false,
        author: (data as any).profiles?.full_name ?? profile?.full_name ?? 'You',
        authorLevel: (data as any).profiles?.level ?? profile?.level ?? 'Founder',
        initials: getInitials(profile?.full_name ?? 'Y'),
        color: colorForId(user.id),
      }

      setPosts(prev => [newEntry, ...prev])
      setNewPost({ content: '', post_type: 'win' })
      setShowCompose(false)

      // Award XP for posting
      try { await supabase.rpc('award_xp', { p_user_id: user.id, p_xp: 10 }) } catch { /* ignore */ }
    } catch (err) {
      console.error('Post failed:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Filtered posts ────────────────────────────────────────────────────────

  const filtered = filter === 'all' ? posts : posts.filter(p => p.post_type === filter)

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar profile={profile} onSignOut={signOut} />

      <main className="flex-1 lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8 md:px-8">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between mb-8"
          >
            <div>
              <h1 className="text-2xl font-display font-semibold text-[#18181B] tracking-tight">Community</h1>
              <p className="text-sm text-[#71717A] mt-1">Surround yourself with women who get it.</p>
            </div>
            <button onClick={() => setShowCompose(!showCompose)} className="btn-primary text-sm gap-1.5">
              <Plus className="w-4 h-4" />
              Post
            </button>
          </motion.div>

          {/* Compose */}
          <AnimatePresence>
            {showCompose && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#18181B]">Share with the community</h3>
                    <button onClick={() => setShowCompose(false)} className="p-1 rounded-lg hover:bg-[#EDE9FE] text-[#A1A1AA]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={newPost.content}
                    onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                    placeholder="Share a win, ask a question, drop a tip..."
                    rows={3}
                    className="input-field resize-none mb-3"
                  />
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex gap-2 flex-wrap">
                      {(['win', 'question', 'accountability', 'update'] as const).map(key => {
                        const meta = CATEGORY_META[key]
                        return (
                          <button
                            key={key}
                            onClick={() => setNewPost(p => ({ ...p, post_type: key }))}
                            className={cn(
                              'text-xs px-2.5 py-1 rounded-full font-medium transition-all',
                              newPost.post_type === key ? 'opacity-100 ring-1' : 'opacity-50 hover:opacity-75'
                            )}
                            style={{ color: meta.color, backgroundColor: meta.bg }}
                          >
                            {meta.label}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={submitPost}
                      disabled={!newPost.content.trim() || submitting}
                      className="btn-primary text-xs px-3 py-1.5 gap-1 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Post
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Tabs */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
            className="flex gap-1 p-1 bg-white rounded-xl border border-[#F4F4F5] mb-6 overflow-x-auto"
          >
            {FILTER_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0',
                  filter === tab.id ? 'bg-[#7C3AED] text-white' : 'text-[#71717A] hover:bg-[#EDE9FE]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 text-[#7C3AED] animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">✨</p>
              <p className="text-sm font-medium text-[#18181B]">Be the first to post!</p>
              <p className="text-xs text-[#A1A1AA] mt-1">Share a win, tip, or question to get the conversation started.</p>
              <button
                onClick={() => setShowCompose(true)}
                className="mt-4 btn-primary text-sm"
              >
                Write a post
              </button>
            </div>
          )}

          {/* Posts */}
          {!loading && (
            <div className="space-y-4">
              {filtered.map((post, i) => {
                const cat = CATEGORY_META[post.post_type] ?? CATEGORY_META.update
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    className="card p-5"
                  >
                    {/* Author Row */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        style={{ backgroundColor: post.color }}
                      >
                        {post.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-[#18181B]">{post.author}</span>
                          <span className="text-xs px-1.5 py-0.5 bg-[#EDE9FE] text-[#7C3AED] rounded-full font-medium capitalize">
                            {post.authorLevel}
                          </span>
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                            style={{ color: cat.color, backgroundColor: cat.bg }}
                          >
                            {cat.label}
                          </span>
                        </div>
                        <p className="text-xs text-[#A1A1AA]">{timeAgo(post.created_at)}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-sm text-[#3F3F46] leading-relaxed mb-4">{post.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-3 border-t border-[#F4F4F5]">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={cn(
                          'flex items-center gap-1.5 text-xs font-medium transition-all',
                          post.liked ? 'text-[#D95B5B]' : 'text-[#A1A1AA] hover:text-[#D95B5B]'
                        )}
                      >
                        <Heart className={cn('w-3.5 h-3.5', post.liked && 'fill-current')} />
                        {post.likes_count}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] hover:text-[#7C3AED] transition-all">
                        <MessageCircle className="w-3.5 h-3.5" />
                        {post.comments_count}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

        </div>
      </main>

      <MobileNav />
    </div>
  )
}
