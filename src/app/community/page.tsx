'use client'


import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Share2, Plus, Send, X } from 'lucide-react'
import { cn, formatRelative, getInitials } from '@/lib/utils'
import { Sidebar } from '@/components/navigation/Sidebar'
import { MobileNav } from '@/components/navigation/MobileNav'
import { useUser } from '@/components/providers/UserProvider'

interface Post {
  id: string
  author: string
  authorLevel: string
  content: string
  category: string
  likes: number
  comments: number
  liked: boolean
  timeAgo: string
  initials: string
  color: string
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    author: 'Maya T.',
    authorLevel: 'Visionary',
    content: 'Just hit $10k in a single month with my Shopify store 🎉 The roadmap inside this app genuinely changed how I approached my launch strategy. If you\'re on the fence about going all-in  -  do it.',
    category: 'win',
    likes: 48,
    comments: 12,
    liked: false,
    timeAgo: '2h ago',
    initials: 'MT',
    color: '#16A34A',
  },
  {
    id: '2',
    author: 'Priya K.',
    authorLevel: 'Founder',
    content: 'Quick tip: I batch my Instagram content every Sunday for the whole week. 2 hours → 7 days of content. Pair it with the content calendar template from the vault and you\'re set.',
    category: 'tip',
    likes: 31,
    comments: 7,
    liked: true,
    timeAgo: '5h ago',
    initials: 'PK',
    color: '#C89070',
  },
  {
    id: '3',
    author: 'Danielle R.',
    authorLevel: 'Starter',
    content: 'Feeling stuck on pricing my coaching packages. Has anyone here moved from hourly to packages? How did you structure it and what worked?',
    category: 'question',
    likes: 14,
    comments: 23,
    liked: false,
    timeAgo: '1d ago',
    initials: 'DR',
    color: '#E5974A',
  },
  {
    id: '4',
    author: 'Camille W.',
    authorLevel: 'CEO',
    content: '6 months ago I had zero clients. Today I just signed my 20th retainer. This community kept me going during the hard weeks. Thank you, genuinely.',
    category: 'win',
    likes: 92,
    comments: 34,
    liked: false,
    timeAgo: '2d ago',
    initials: 'CW',
    color: '#7C3AED',
  },
  {
    id: '5',
    author: 'Jasmine O.',
    authorLevel: 'Founder',
    content: 'Resource recommendation: "Company of One" by Paul Jarvis. Life-changing perspective on building a business that works for YOU, not the other way around.',
    category: 'resource',
    likes: 27,
    comments: 8,
    liked: false,
    timeAgo: '3d ago',
    initials: 'JO',
    color: '#A1A1AA',
  },
]

const CATEGORY_META: Record<string, { label: string; color: string; bg: string }> = {
  win: { label: 'Win', color: '#16A34A', bg: '#DCFCE7' },
  tip: { label: 'Tip', color: '#E5974A', bg: '#FDF3EA' },
  question: { label: 'Question', color: '#7C3AED', bg: '#EDE9FE' },
  resource: { label: 'Resource', color: '#A1A1AA', bg: '#FAFAFA' },
}

const FILTER_TABS = [
  { id: 'all', label: 'All Posts' },
  { id: 'win', label: 'Wins' },
  { id: 'tip', label: 'Tips' },
  { id: 'question', label: 'Questions' },
  { id: 'resource', label: 'Resources' },
]

export default function CommunityPage() {
  const { profile, signOut } = useUser()
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [filter, setFilter] = useState('all')
  const [showCompose, setShowCompose] = useState(false)
  const [newPost, setNewPost] = useState({ content: '', category: 'win' })

  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter)

  function toggleLike(id: string) {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ))
  }

  function submitPost() {
    if (!newPost.content.trim()) return
    const post: Post = {
      id: Date.now().toString(),
      author: profile?.full_name ?? 'You',
      authorLevel: profile?.level ?? 'Founder',
      content: newPost.content.trim(),
      category: newPost.category,
      likes: 0,
      comments: 0,
      liked: false,
      timeAgo: 'just now',
      initials: getInitials(profile?.full_name ?? 'You'),
      color: '#7C3AED',
    }
    setPosts(prev => [post, ...prev])
    setNewPost({ content: '', category: 'win' })
    setShowCompose(false)
  }

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
          {showCompose && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mb-6">
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
                className="input-field text-sm resize-none mb-3"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <button
                      key={key}
                      onClick={() => setNewPost(p => ({ ...p, category: key }))}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full font-medium transition-all',
                        newPost.category === key ? 'opacity-100' : 'opacity-50'
                      )}
                      style={{ color: meta.color, backgroundColor: meta.bg }}
                    >
                      {meta.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={submitPost}
                  disabled={!newPost.content.trim()}
                  className="btn-primary text-xs px-3 py-1.5 gap-1"
                >
                  <Send className="w-3 h-3" />
                  Post
                </button>
              </div>
            </motion.div>
          )}

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

          {/* Posts */}
          <div className="space-y-4">
            {filtered.map((post, i) => {
              const cat = CATEGORY_META[post.category]
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
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
                        <span className="text-xs px-1.5 py-0.5 bg-[#EDE9FE] text-[#7C3AED] rounded-full font-medium">
                          {post.authorLevel}
                        </span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                          style={{ color: cat.color, backgroundColor: cat.bg }}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <p className="text-xs text-[#A1A1AA]">{post.timeAgo}</p>
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
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] hover:text-[#7C3AED] transition-all">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {post.comments}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] hover:text-[#7C3AED] transition-all ml-auto">
                      <Share2 className="w-3.5 h-3.5" />
                      Share
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

        </div>
      </main>

      <MobileNav />
    </div>
  )
}
