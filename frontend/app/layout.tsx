import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from 'next-themes';
import ClientLayout from "../components/shared/ClientLayout";
import ConditionalNavbar from "../components/shared/ConditionalNavbar";

// Optimized font loading with display swap
const syne = Syne({
  subsets: ["latin"],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-mono',
  display: 'swap',
  preload: false, // Not critical, load later
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-resume-analyzer-pk.vercel.app'),
  title: 'SkillSense — AI-Powered Resume Analysis & Career Builder',
  description: 'Optimize your resume with SkillSense. Get instant ATS scores, AI-driven insights, and professional resume building tools designed to land your dream job.',
  keywords: ['resume analyzer', 'ATS optimization', 'AI resume', 'career builder', 'job search', 'resume score'],
  authors: [{ name: 'SkillSense Team' }],
  creator: 'SkillSense',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'SkillSense',
    title: 'SkillSense — Land Your Dream Job',
    description: 'Get professional resume analysis and ATS optimization with SkillSense AI.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SkillSense - AI Resume Analyzer',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillSense — AI Resume Analyzer',
    description: 'Optimize your resume with AI-powered insights and ATS scoring.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#00E5FF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://uzair001-ai-resume-api.hf.space" />
        <link rel="dns-prefetch" href="https://uzair001-ai-resume-api.hf.space" />
      </head>
      <body className={`${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-body bg-bg-dark text-text-primary`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClientLayout>
            <div className="min-h-screen flex flex-col">
              <ConditionalNavbar />
              <main className="flex-grow pt-20 sm:pt-24">
                {children}
              </main>
            </div>
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
