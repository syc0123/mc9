import Navbar from "@/components/layout/Navbar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact — MC9",
  description: "MC9 팀에게 문의하세요.",
}

const contactItems = [
  {
    label: "이메일",
    content: (
      <a href="mailto:hello@mc9.app" className="text-green-600 hover:underline">
        hello@mc9.app
      </a>
    ),
  },
  {
    label: "GitHub",
    content: <p className="text-gray-600">이슈 및 기여는 GitHub에서 환영합니다.</p>,
  },
  {
    label: "응답 시간",
    content: <p className="text-gray-600">영업일 기준 1-3일 이내 답변 드립니다.</p>,
  },
]

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-xl px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Contact</h1>
        <p className="text-gray-600 mb-8">
          버그 신고, 기능 제안, 파트너십 문의 등 무엇이든 아래로 보내주세요.
        </p>
        <div className="space-y-4">
          {contactItems.map((item) => (
            <div key={item.label} className="p-4 rounded-lg border">
              <p className="font-medium">{item.label}</p>
              {item.content}
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
