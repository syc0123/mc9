import Navbar from "@/components/layout/Navbar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — MC9",
  description: "MC9의 개인정보 처리방침을 확인하세요.",
}

const sections = [
  {
    title: "수집하는 정보",
    content:
      "회원가입 시 이메일 주소와 비밀번호를 수집합니다. Google 로그인을 사용하는 경우 Google 계정의 기본 프로필 정보(이름, 이메일)를 수집합니다.",
  },
  {
    title: "제3자 공유",
    content:
      "MC9은 사용자의 개인정보를 제3자에게 판매하지 않습니다. Supabase(데이터베이스), Google(OAuth)와 같은 서비스 제공자와만 필요한 범위에서 공유합니다.",
  },
  {
    title: "데이터 삭제",
    content:
      "계정 설정 페이지에서 언제든지 계정을 삭제할 수 있습니다. 삭제 시 모든 개인 데이터가 영구적으로 제거됩니다.",
  },
  {
    title: "쿠키",
    content:
      "로그인 상태 유지를 위해 세션 쿠키를 사용합니다. 광고 목적의 트래킹 쿠키는 광고 코드 삽입 시 적용될 수 있습니다.",
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">최종 업데이트: 2026년 4월 24일</p>
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold mb-3">정보 이용 목적</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>서비스 제공 및 계정 관리</li>
              <li>워크스페이스 멤버 초대 및 관리</li>
              <li>서비스 개선을 위한 익명 사용 통계</li>
            </ul>
          </section>
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-semibold mb-3">{s.title}</h2>
              <p>{s.content}</p>
            </section>
          ))}
          <section>
            <h2 className="text-xl font-semibold mb-3">문의</h2>
            <p>
              개인정보와 관련한 문의는{" "}
              <a href="/contact" className="text-green-600 hover:underline">
                Contact
              </a>{" "}
              페이지로 보내주세요.
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
