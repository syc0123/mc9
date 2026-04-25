import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import ThemeToggle from "./ThemeToggle"

export default async function Navbar() {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase init failed — render unauthenticated state
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-base tracking-tight">
            <span className="text-primary">⛏</span>
            <span>MC9</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/crafting">아이템 사전</NavLink>
            <NavLink href="/potions">포션</NavLink>
            <NavLink href="/enchants">인챈트</NavLink>
            {user && <NavLink href="/servers">내 서버</NavLink>}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link
              href="/servers"
              className="text-sm font-medium px-4 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] transition-colors"
            >
              대시보드
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-foreground-muted hover:text-foreground transition-colors px-3 py-1.5"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium px-4 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-[var(--primary-hover)] transition-colors"
              >
                시작하기
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-sm text-foreground-muted hover:text-foreground hover:bg-accent transition-colors"
    >
      {children}
    </Link>
  )
}
