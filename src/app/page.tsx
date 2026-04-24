import Link from "next/link"
import Navbar from "@/components/layout/Navbar"

const features = [
  {
    icon: "🧪",
    title: "포션 사전",
    desc: "모든 포션 조합법과 효과를 한 눈에. Java & Bedrock 구분 제공.",
    href: "/potions",
  },
  {
    icon: "✨",
    title: "인챈트 가이드",
    desc: "레벨별 인챈트 효과, 호환/비호환 조합 완벽 정리.",
    href: "/enchants",
  },
  {
    icon: "🗺️",
    title: "서버 맵 뷰어",
    desc: "Dynmap 연동 인터랙티브 맵. 마커를 찍어 팀과 정보를 공유하세요.",
    href: "/register",
  },
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 px-4 text-center bg-gradient-to-b from-green-50 to-white">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
              마인크래프트의 모든 것,<br />
              <span className="text-green-600">한 곳에서</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              포션 조합법, 인챈트 가이드, 크래프팅 레시피. 그리고 서버 관리자라면 인터랙티브 맵으로 팀과 함께 탐험하세요.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/potions"
                className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
              >
                포션 사전 보기
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-lg text-lg font-medium hover:bg-green-50 transition-colors"
              >
                서버 맵 시작하기
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">주요 기능</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f) => (
                <Link
                  key={f.title}
                  href={f.href}
                  className="p-6 rounded-xl border hover:border-green-400 hover:shadow-md transition-all group"
                >
                  <div className="text-4xl mb-4">{f.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-600">{f.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-green-600 text-white text-center">
          <div className="container mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">서버 관리자이신가요?</h2>
            <p className="text-green-100 mb-8 text-lg">
              Dynmap을 연동하면 팀원들과 인터랙티브 맵을 공유하고, 마커로 중요 위치를 표시할 수 있어요.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg text-lg font-medium hover:bg-green-50 transition-colors"
            >
              무료로 시작하기
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4 text-center text-sm text-gray-500">
        <div className="container mx-auto flex flex-wrap justify-center gap-6">
          <Link href="/about" className="hover:text-gray-900">About</Link>
          <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
          <Link href="/contact" className="hover:text-gray-900">Contact</Link>
          <Link href="/potions" className="hover:text-gray-900">포션 사전</Link>
          <Link href="/enchants" className="hover:text-gray-900">인챈트</Link>
        </div>
        <p className="mt-4">© 2026 MC9. All rights reserved.</p>
      </footer>
    </>
  )
}
