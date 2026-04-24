import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import { FlaskConical, Sparkles, Map, ArrowRight } from "lucide-react"

const features = [
  {
    icon: FlaskConical,
    label: "POTIONS",
    title: "포션 사전",
    desc: "모든 포션 조합법과 효과를 한눈에. Java & Bedrock 버전별 정리.",
    href: "/potions",
  },
  {
    icon: Sparkles,
    label: "ENCHANTS",
    title: "인챈트 가이드",
    desc: "레벨별 인챈트 효과, 호환/비호환 조합 완벽 정리.",
    href: "/enchants",
  },
  {
    icon: Map,
    label: "SERVER MAP",
    title: "서버 맵 뷰어",
    desc: "Dynmap 연동 인터랙티브 맵. 마커로 팀과 정보를 공유하세요.",
    href: "/register",
  },
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative py-28 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="container mx-auto max-w-3xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-foreground-muted uppercase tracking-widest mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Minecraft SaaS
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              마인크래프트의 모든 것,
              <br />
              <span className="text-primary">한 곳에서</span>
            </h1>
            <p className="text-lg text-foreground-muted mb-10 max-w-xl mx-auto leading-relaxed">
              포션 조합법, 인챈트 가이드, 크래프팅 레시피. 서버 관리자라면 인터랙티브 맵으로 팀과 함께 탐험하세요.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/potions"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
              >
                포션 사전 보기
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-border text-foreground rounded-md text-sm font-medium hover:bg-accent transition-colors"
              >
                서버 맵 시작하기
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-3">Features</p>
              <h2 className="text-3xl font-bold tracking-tight">주요 기능</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {features.map((f) => {
                const Icon = f.icon
                return (
                  <Link
                    key={f.title}
                    href={f.href}
                    className="group p-6 rounded-lg border border-border bg-surface hover:border-primary/40 transition-all"
                  >
                    <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-4">{f.label}</p>
                    <Icon size={24} className="text-primary mb-3" />
                    <h3 className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">{f.desc}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 border-t border-border">
          <div className="container mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-foreground-muted mb-3">For Server Admins</p>
            <h2 className="text-3xl font-bold tracking-tight mb-4">서버 관리자이신가요?</h2>
            <p className="text-foreground-muted mb-8 leading-relaxed">
              Dynmap을 연동하면 팀원들과 인터랙티브 맵을 공유하고, 마커로 중요 위치를 표시할 수 있어요.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              무료로 시작하기
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-wrap justify-center gap-6 text-sm text-foreground-muted">
          <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          <Link href="/potions" className="hover:text-foreground transition-colors">포션 사전</Link>
          <Link href="/enchants" className="hover:text-foreground transition-colors">인챈트</Link>
        </div>
        <p className="text-center text-xs text-foreground-muted mt-4">© 2026 MC9. All rights reserved.</p>
      </footer>
    </>
  )
}
