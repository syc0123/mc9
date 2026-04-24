import Navbar from "@/components/layout/Navbar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About — MC9",
  description: "MC9은 마인크래프트 플레이어와 서버 관리자를 위한 정보 허브 및 협업 맵 플랫폼입니다.",
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">About MC9</h1>
        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-lg text-gray-700">
            MC9은 전 세계 마인크래프트 플레이어를 위해 만들어진 종합 정보 플랫폼입니다.
            포션 조합부터 인챈트 가이드, 크래프팅 레시피까지 — 야생에서 필요한 모든 정보를 빠르게 찾을 수 있습니다.
          </p>
          <h2 className="text-2xl font-semibold mt-8">우리가 만드는 것</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>정확하고 최신화된 마인크래프트 야생 정보 데이터베이스</li>
            <li>서버 관리자를 위한 Dynmap 기반 인터랙티브 맵 뷰어</li>
            <li>팀과 함께 사용하는 공유 마커 및 메모 시스템</li>
          </ul>
          <h2 className="text-2xl font-semibold mt-8">연락하기</h2>
          <p className="text-gray-700">
            문의 사항은{" "}
            <a href="/contact" className="text-green-600 hover:underline">
              Contact 페이지
            </a>
            를 통해 보내주세요.
          </p>
        </div>
      </main>
    </>
  )
}
