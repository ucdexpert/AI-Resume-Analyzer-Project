import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SkillSense - AI-Powered Resume Analyzer & Career Tools',
  description: 'Transform your resume with AI-powered analysis, ATS optimization, cover letter generation, and LinkedIn profile enhancement. Get hired faster with SkillSense.',
  keywords: 'resume analyzer, ATS checker, AI resume, cover letter generator, LinkedIn optimizer, job search, career tools, resume builder',
  authors: [{ name: 'SkillSense' }],
  creator: 'SkillSense',
  publisher: 'SkillSense',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://skillsense.ai',
    title: 'SkillSense - AI Resume Analyzer',
    description: 'AI-powered resume analysis and career optimization tools',
    siteName: 'SkillSense',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SkillSense AI Resume Analyzer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillSense - AI Resume Analyzer',
    description: 'Transform your resume with AI-powered analysis',
    images: ['/og-image.png'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#00E5FF',
}
