import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: { default: "MC9 — 마인크래프트 정보 허브 & 서버 맵", template: "%s | MC9" },
  description: "마인크래프트 포션 사전, 인챈트 가이드, 크래프팅 레시피와 서버 인터랙티브 맵을 한 곳에서.",
  keywords: ["마인크래프트", "minecraft", "포션", "인챈트", "크래프팅", "서버 맵"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geist.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
