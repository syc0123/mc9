import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function Navbar() {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase 초기화 실패 시 미인증 상태로 렌더링
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-green-600">⛏</span>
          <span>MC9</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/potions" className="hover:text-green-600 transition-colors">포션 사전</Link>
          <Link href="/enchants" className="hover:text-green-600 transition-colors">인챈트</Link>
          <Link href="/crafting" className="hover:text-green-600 transition-colors">크래프팅</Link>
          {user && (
            <Link href="/servers" className="hover:text-green-600 transition-colors">내 서버</Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/servers"
              className="text-sm font-medium px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              대시보드
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm hover:text-green-600">로그인</Link>
              <Link
                href="/register"
                className="text-sm font-medium px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
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
