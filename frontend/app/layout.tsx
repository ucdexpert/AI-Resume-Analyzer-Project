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
  title: 'SkillSense — AI-Powered Resume Analysis & Career Builder',
  description: 'Optimize your resume with SkillSense. Get instant ATS scores, AI-driven insights, and professional resume building tools designed to land your dream job.',
  openGraph: {
    title: 'SkillSense — Land Your Dream Job',
    description: 'Get professional resume analysis and ATS optimization with SkillSense AI.',
    images: ['/og-image.png'],
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
      <body className={`${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} font-body bg-bg-dark text-text-primary`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClientLayout>
            <div className="min-h-screen flex flex-col">
              <ConditionalNavbar />
              <main className="flex-grow">
                {children}
              </main>
            </div>
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
