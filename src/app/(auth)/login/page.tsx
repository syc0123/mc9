'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }
    router.push('/servers')
    router.refresh()
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-semibold text-primary">⛏ MC9</Link>
          <h1 className="text-2xl font-bold tracking-tight mt-6 mb-1">로그인</h1>
          <p className="text-sm text-foreground-muted">계정에 로그인하세요</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-foreground-muted">이메일</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-foreground-muted">비밀번호</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <div className="flex items-center gap-3 text-xs text-foreground-muted">
            <div className="flex-1 h-px bg-border" />
            <span>또는</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-2 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center justify-center gap-2"
          >
            <span className="font-bold text-base leading-none">G</span>
            Google로 로그인
          </button>
        </div>
        <p className="text-center text-sm text-foreground-muted mt-6">
          계정이 없으신가요?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">회원가입</Link>
        </p>
      </div>
    </div>
  )
}
