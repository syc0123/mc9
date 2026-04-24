import type { Metadata } from "next"
import Navbar from "@/components/layout/Navbar"

export const metadata: Metadata = {
  description: "마인크래프트 야생 생존을 위한 포션, 인챈트, 크래프팅 레시피 완전 가이드",
}

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="container mx-auto max-w-5xl px-4 py-10">
        {children}
      </div>
    </>
  )
}
