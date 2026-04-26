'use client';

import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LanguageToggle from "@/components/shared/LanguageToggle";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { ThemeProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const syne = Syne({ 
  subsets: ["latin"],
  variable: '--font-heading',
});

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-body',
});

const jetBrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono',
});

import Navbar from "@/components/shared/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { direction } = useLanguageStore();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            router.push('/dashboard');
            break;
          case 'b':
            e.preventDefault();
            router.push('/builder');
            break;
          case 'h':
            e.preventDefault();
            router.push('/dashboard'); // History is currently part of Dashboard
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return (
    <html lang="en" dir={direction} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00E5FF" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-body bg-bg-dark text-text-primary`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-16">
                {children}
            </main>
            </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
