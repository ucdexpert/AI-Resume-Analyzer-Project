'use client';

import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LanguageToggle from "../components/shared/LanguageToggle";
import { useLanguageStore } from "../stores/useLanguageStore";
import { ThemeProvider } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from "../components/shared/Navbar";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { direction } = useLanguageStore();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

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
        <title>SkillSense — AI-Powered Resume Analysis & Career Builder</title>
        <meta name="description" content="Optimize your resume with SkillSense. Get instant ATS scores, AI-driven insights, and professional resume building tools designed to land your dream job." />
        <meta property="og:title" content="SkillSense — Land Your Dream Job" />
        <meta property="og:description" content="Get professional resume analysis and ATS optimization with SkillSense AI." />
        <meta property="og:image" content="/og-image.png" />
      </head>
      <body className={`${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-body bg-bg-dark text-text-primary`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <div className="min-h-screen flex flex-col">
            {!isAdminPage && <Navbar />}
            <main className={`flex-grow ${isAdminPage ? '' : 'pt-24 md:pt-28'}`}>
                {children}
            </main>
            </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
