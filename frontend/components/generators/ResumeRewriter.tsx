'use client';

import React, { useState } from 'react';
import { rewriteResume, generateImprovedPDF } from '../../lib/api';
import { MagicWand, Copy, Check, ArrowsLeftRight, ArrowRight, FilePdf } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../stores/useAuthStore';
import UpgradeModal from '../shared/UpgradeModal';

const STYLES = [
  { id: 'Professional', icon: '💼', desc: 'Balanced, formal, and corporate-ready.' },
  { id: 'Creative', icon: '🎨', desc: 'Modern, engaging, and personality-driven.' },
  { id: 'Technical', icon: '💻', desc: 'Skill-focused, precise, and metric-heavy.' },
  { id: 'Executive', icon: '👔', desc: 'Leadership-oriented with strategic impact.' }
];

export default function ResumeRewriter({ resumeText }: { resumeText: string }) {
  const { user } = useAuthStore();
  const isPro = user?.plan?.toLowerCase() === 'pro';
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [style, setStyle] = useState('Professional');
  const [rewritten, setRewritten] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatResumeText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('##')) {
        return (
          <div key={i} className="text-brand-primary 
            font-bold text-xs uppercase tracking-widest 
            mt-4 mb-1 border-b border-brand-primary/30 pb-1">
            {line.replace('##', '').trim()}
          </div>
        )
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />
      }
      return (
        <p key={i} className="text-white/80 text-xs 
          leading-relaxed mb-1">
          {line}
        </p>
      )
    })
  }

  const handleRewrite = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    setError(null);
    if (!resumeText || resumeText.trim() === '') {
      setError('Resume text is empty. Please upload and analyze your resume first.');
      return;
    }
    console.log('Rewriting resume with style:', style);
    setLoading(true);
    try {
      const res = await rewriteResume(resumeText, style);
      console.log('API response for rewriteResume:', res);
      if (typeof res === 'object' && res !== null && 'rewritten_text' in res) {
        const rewrittenText = res.rewritten_text;
        if (typeof rewrittenText === 'string') {
          setRewritten(rewrittenText);
        } else {
          setRewritten(JSON.stringify(res, null, 2));
          setError('Unexpected response format from AI. Displaying raw response.');
        }
      } else if (typeof res === 'string') {
        setRewritten(res);
      } else {
        setRewritten(JSON.stringify(res, null, 2));
        setError('Unexpected response format from AI. Displaying raw response.');
      }
    } catch (err: any) {
      console.error('Failed to rewrite resume:', err);
      setError(err.response?.data?.detail || 'Failed to rewrite resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!rewritten) return;
    navigator.clipboard.writeText(rewritten);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!rewritten) return;
    setDownloading(true);
    try {
      const blob = await generateImprovedPDF(rewritten, `Enhanced_${style}_Resume.pdf`, style);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Enhanced_${style}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert("Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="glass-card p-4 sm:p-6 md:p-8 mb-8 sm:mb-10 md:mb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary flex-shrink-0">
          <MagicWand size={24} weight="duotone" className="sm:hidden" />
          <MagicWand size={28} weight="duotone" className="hidden sm:block" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">AI Resume Rewriter</h3>
          <p className="text-text-muted text-xs sm:text-sm mt-1">Transform your entire resume into a specific professional style.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStyle(s.id)}
            className={`p-3 sm:p-4 rounded-xl border text-left transition-all ${
              style === s.id
                ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(0,229,255,0.1)]'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{s.icon}</div>
            <div className={`font-bold text-xs sm:text-sm ${style === s.id ? 'text-brand-primary' : 'text-white'}`}>{s.id}</div>
            <div className="text-[9px] sm:text-[10px] text-text-muted mt-0.5 sm:mt-1 leading-tight line-clamp-2">{s.desc}</div>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-brand-danger/10 border border-brand-danger/20 text-brand-danger p-4 rounded-lg mb-8 text-center text-sm">
          {error}
        </div>
      )}

      {!rewritten && !loading && (
        <div className="flex justify-center">
            <button 
                onClick={handleRewrite}
                className="neon-button !px-12 flex items-center gap-2 group"
            >
                Rewrite Resume in {style} Style
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      )}

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
          <p className="text-brand-primary font-bold animate-pulse uppercase tracking-widest text-xs">Llama 3.3 is rewriting your resume...</p>
        </div>
      )}

      <AnimatePresence>
        {rewritten && !loading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase mb-2 ml-1">Original Text</label>
                <div className="flex-1 p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl overflow-y-auto text-xs text-text-muted leading-relaxed h-[300px] sm:h-[400px] md:h-[450px] max-h-[450px] scrollbar-thin scrollbar-thumb-white/20">
                  {resumeText}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="text-[10px] font-bold text-brand-primary uppercase">Rewritten ({style})</label>
                    <button
                        onClick={handleCopy}
                        className="text-[10px] flex items-center gap-1 text-brand-primary hover:underline"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <div className="flex-1 p-3 sm:p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl overflow-y-auto text-xs text-white leading-relaxed h-[300px] sm:h-[400px] md:h-[450px] max-h-[450px] scrollbar-thin scrollbar-thumb-brand-primary/30">
                  {formatResumeText(rewritten)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button 
                    onClick={() => setRewritten('')}
                    className="glass-card !bg-white/5 border-white/10 px-6 py-2 text-sm text-text-muted hover:text-white transition-colors"
                >
                    Try Different Style
                </button>
                <button 
                    onClick={handleDownload}
                    disabled={downloading}
                    className="glass-card border-brand-primary/30 text-brand-primary !px-8 !py-2 flex items-center gap-2 font-bold hover:bg-brand-primary/10 transition-all"
                >
                    {downloading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FilePdf weight="fill" />}
                    Download Enhanced PDF
                </button>
                <button 
                    onClick={handleCopy}
                    className="neon-button !px-8 flex items-center gap-2"
                >
                    <Copy weight="bold" />
                    Copy Enhanced Resume
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
