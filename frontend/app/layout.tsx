'use client';

import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import LanguageToggle from "@/components/shared/LanguageToggle";
import { useLanguageStore } from "@/stores/useLanguageStore";

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

  return (
    <html lang="en" dir={direction}>
      <body className={`${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-body bg-background-primary text-text-primary`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <header className="fixed top-24 right-6 z-50">
            <LanguageToggle />
          </header>
          <main className="flex-grow pt-24">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
