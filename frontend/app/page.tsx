'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import DropZone from '../components/upload/DropZone';
import AuthModal from '../components/auth/AuthModal';
import useAuthStore from '../stores/useAuthStore';
import { useAnalysisStore } from '../stores/useAnalysisStore';
import { analyzeResume } from '../lib/api';
import { useRouter } from 'next/navigation';
import { Sparkle, Target, Rocket, ChartLineUp, FileText, MagnifyingGlass, Lightbulb, User } from '@phosphor-icons/react';
import { useLanguageStore } from '../stores/useLanguageStore';
import { translations } from '../lib/translations';

export default function Home() {
  const { lang } = useLanguageStore();
  const t = translations[lang];
  const { isLoggedIn, user } = useAuthStore();
  const { setAnalyzing, setResult, setError } = useAnalysisStore();
  const router = useRouter();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File, jd: string } | null>(null);

  const startAnalysis = async (file: File, jobDescription: string) => {
    setAnalyzing(true);
    try {
      const data = await analyzeResume(file, jobDescription, lang);
      setResult(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  const onAuthRequired = (file: File, jd: string) => {
    setPendingFile({ file, jd });
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (pendingFile) {
      startAnalysis(pendingFile.file, pendingFile.jd);
      setPendingFile(null);
    }
  };

  const features = [
    {
      icon: <ChartLineUp size={32} weight="duotone" className="text-brand-primary" />,
      title: t.atsScore,
      description: "Get a detailed 0-100 score based on formatting, skills, and experience."
    },
    {
      icon: <Target size={32} weight="duotone" className="text-brand-success" />,
      title: "ATS Optimization",
      description: "Ensure your resume passes through Applicant Tracking Systems easily."
    },
    {
      icon: <Rocket size={32} weight="duotone" className="text-brand-warning" />,
      title: "Career Growth",
      description: "Receive actionable suggestions to improve your professional profile."
    }
  ];

  const steps = [
    {
      icon: <FileText size={40} weight="duotone" className="text-brand-primary" />,
      title: "Upload Resume",
      description: "Drop your PDF resume. Our AI extracts text with high precision."
    },
    {
      icon: <MagnifyingGlass size={40} weight="duotone" className="text-brand-success" />,
      title: "AI Analysis",
      description: "Llama 3.3 analyzes your skills, experience, and formatting."
    },
    {
      icon: <Lightbulb size={40} weight="duotone" className="text-brand-warning" />,
      title: "Get Insights",
      description: "Receive a detailed report with scores, tips, and interview prep."
    }
  ];

  return (
    <div className="relative isolate pt-14 pb-20 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-brand-primary to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-primary text-sm font-medium mb-6">
              <Sparkle weight="fill" />
              Powered by Groq Llama 3.3 Versatile
            </span>
            
            {isLoggedIn && user ? (
               <div className="mb-8 flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4 border border-brand-primary/20">
                    <User size={32} weight="duotone" />
                 </div>
                 <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user.name}!</h2>
                 <p className="text-text-muted">Ready to optimize another resume?</p>
               </div>
            ) : (
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
                {t.heroTitle.split(' ').map((word, i) => (
                  <span key={i} className={word === 'Resume' || word === 'ریزیومے' || word === 'السيرة' ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-cyan-400' : ''}>
                    {word}{' '}
                  </span>
                ))}
              </h1>
            )}

            {!isLoggedIn && (
               <p className="text-xl text-text-muted mb-10 leading-relaxed">
                 {t.heroSub}
               </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <DropZone onAuthRequired={onAuthRequired} />
          </motion.div>
        </div>

        {showAuthModal && (
          <AuthModal 
            onSuccess={handleAuthSuccess}
            onClose={() => {
              setShowAuthModal(false);
              setPendingFile(null);
            }}
          />
        )}

        {/* Stats Counter Section */}
        <div className="mt-32 mb-40 border-y border-white/5 py-16 bg-white/[0.01]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Resumes Analyzed', value: '10,000+', icon: <FileText size={24} /> },
              { label: 'Happy Users', value: '5,000+', icon: <User size={24} /> },
              { label: 'AI Insights Generated', value: '50,000+', icon: <Lightbulb size={24} /> },
              { label: 'Success Rate', value: '94%', icon: <Rocket size={24} /> },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-brand-primary mb-3 flex justify-center opacity-50">{stat.icon}</div>
                <div className="text-3xl md:text-5xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-xs md:text-sm text-text-muted font-bold uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Before/After Section */}
        <div className="mb-40">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">See the <span className="text-brand-primary">Difference</span></h2>
              <p className="text-text-muted">Transform your resume from "Just another candidate" to "Perfect match".</p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Before */}
              <div className="relative group">
                <div className="absolute -top-4 left-6 bg-red-500/20 text-red-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-red-500/30">Before SkillSense</div>
                <div className="glass-card p-8 border-red-500/10 grayscale opacity-60">
                   <div className="h-4 w-1/3 bg-white/10 rounded mb-4"></div>
                   <div className="space-y-3">
                      <div className="h-2 w-full bg-white/5 rounded"></div>
                      <div className="h-2 w-full bg-white/5 rounded"></div>
                      <div className="h-2 w-2/3 bg-white/5 rounded"></div>
                   </div>
                   <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-bold uppercase">ATS SCORE</span>
                      <span className="text-2xl font-black text-red-500">42%</span>
                   </div>
                </div>
              </div>

              {/* After */}
              <div className="relative group">
                <div className="absolute -top-4 left-6 bg-brand-primary/20 text-brand-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-brand-primary/30 z-10 animate-pulse">After SkillSense</div>
                <div className="glass-card p-8 border-brand-primary/50 shadow-[0_0_40px_rgba(0,229,255,0.1)] relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4">
                      <Sparkle size={24} className="text-brand-primary" weight="fill" />
                   </div>
                   <div className="h-4 w-1/3 bg-brand-primary/20 rounded mb-4"></div>
                   <div className="space-y-3">
                      <div className="h-2 w-full bg-brand-primary/10 rounded"></div>
                      <div className="h-2 w-full bg-brand-primary/10 rounded"></div>
                      <div className="h-2 w-5/6 bg-brand-primary/10 rounded"></div>
                   </div>
                   <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-brand-primary font-bold uppercase tracking-widest">ATS SCORE</span>
                      <span className="text-4xl font-black text-white neon-text-glow">98%</span>
                   </div>
                </div>
              </div>
           </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 mb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">How It Works</h2>
            <p className="text-text-muted">Optimize your career path in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10"></div>
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-brand-primary/10 group-hover:border-brand-primary/30 transition-all duration-300">
                  {step.icon}
                </div>
                <h3 className="text-xl font-heading font-bold mb-3">{step.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed max-w-[250px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-40">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">What Our <span className="text-brand-primary">Users Say</span></h2>
              <p className="text-text-muted">Thousands of professionals have already landed their dream jobs.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "Software Engineer",
                  text: "SkillSense helped me identify key missing skills on my resume. I landed 3 interviews within a week of making the changes!",
                  avatar: "SC"
                },
                {
                  name: "James Wilson",
                  role: "Product Manager",
                  text: "The ATS score is scarily accurate. I compared it with my internal recruiter tools and SkillSense is spot on.",
                  avatar: "JW"
                },
                {
                  name: "Priya Patel",
                  role: "Marketing Director",
                  text: "The AI suggestions are professional and actionable. It's like having a career coach available 24/7.",
                  avatar: "PP"
                }
              ].map((testi, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 flex flex-col justify-between"
                >
                   <p className="text-gray-300 italic mb-8 leading-relaxed">"{testi.text}"</p>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold border border-brand-primary/30">
                        {testi.avatar}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">{testi.name}</h4>
                        <p className="text-text-muted text-xs uppercase tracking-widest">{testi.role}</p>
                      </div>
                   </div>
                </motion.div>
              ))}
           </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 hover:border-white/20 transition-colors group"
            >
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-heading mb-2">{feature.title}</h3>
              <p className="text-text-muted leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
