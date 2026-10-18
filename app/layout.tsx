import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cache Components チュートリアル",
  description: "Next.js の Cache Components を動かしながら理解するサンプル",
};

const LESSONS = [
  { href: "/", label: "0. はじめに" },
  { href: "/basics", label: "1. 静的・キャッシュ・動的" },
  { href: "/cache-life", label: "2. cacheLife（寿命）" },
  { href: "/cache-keys", label: "3. キャッシュキー（引数）" },
  { href: "/revalidation", label: "4. タグと再検証" },
  { href: "/runtime-data", label: "5. cookies とキャッシュ" },
  { href: "/interleaving", label: "6. children の差し込み" },
] as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col md:flex-row">
        <nav className="border-b border-zinc-200 p-4 md:w-60 md:shrink-0 md:border-r md:border-b-0 dark:border-zinc-800">
          <p className="mb-3 text-sm font-bold">Cache Components 入門</p>
          <ul className="space-y-1 text-sm">
            {LESSONS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block rounded px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
