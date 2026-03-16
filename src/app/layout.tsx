import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "DevRoast",
  description: "DevRoast application built with Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetBrainsMono.variable} font-sans`}>
        <TRPCReactProvider>
          <header className="h-14 w-full border-b border-border-primary bg-bg-page px-6 md:px-10">
            <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between">
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-mono"
              >
                <span className="text-xl font-bold text-accent-green">
                  &gt;
                </span>
                <span className="text-lg font-medium text-text-primary">
                  devroast
                </span>
              </Link>

              <nav className="inline-flex items-center gap-6">
                <Link
                  href="/leaderboard"
                  className="font-mono text-[13px] text-text-secondary transition-colors hover:text-text-primary"
                >
                  leaderboard
                </Link>
              </nav>
            </div>
          </header>

          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
