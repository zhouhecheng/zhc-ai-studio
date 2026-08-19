import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "ZHC AI STUDIO｜周合成 AI 影视与视觉创作工作室";
const description = "周合成的 AI 创作作品集，涵盖 AI 漫剧、真人短剧、口播、信息流广告、宣传片、AI 绘图与个人集锦。";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const socialImage = `${origin}/og.png`;

  return {
    title,
    description,
    alternates: { canonical: origin },
    openGraph: {
      title,
      description,
      type: "website",
      url: origin,
      siteName: "ZHC AI STUDIO",
      locale: "zh_CN",
      images: [{ url: socialImage, width: 1728, height: 907, alt: "ZHC AI STUDIO" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="/fonts/lxgw-wenkai-screen.css" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
