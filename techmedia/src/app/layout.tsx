import type { Metadata } from "next";
import "./globals.css";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "테크미디어";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — 테크 전문 뉴스`,
    template: `%s | ${SITE_NAME}`,
  },
  description: "테크 기업과 산업 동향을 전하는 1인 테크 전문 언론사",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
