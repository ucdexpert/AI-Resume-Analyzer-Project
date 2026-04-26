'use client';

import React, { useState } from 'react';
import { rewriteResume, generateImprovedPDF } from '../../lib/api';
import { MagicWand, Copy, Check, ArrowsLeftRight, ArrowRight, FilePdf } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

const STYLES = [
  { id: 'Professional', icon: '💼', desc: 'Balanced, formal, and corporate-ready.' },
  { id: 'Creative', icon: '🎨', desc: 'Modern, engaging, and personality-driven.' },
  { id: 'Technical', icon: '💻', desc: 'Skill-focused, precise, and metric-heavy.' },
  { id: 'Executive', icon: '👔', desc: 'Leadership-oriented with strategic impact.' }
];

export default function ResumeRewriter({ resumeText }: { resumeText: string }) {
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
      const blob = await generateImprovedPDF(rewritten, `Enhanced_${style}_Resume.pdf`);
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
    <div className="glass-card p-8 mb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
          <MagicWand size={28} weight="duotone" />
        </div>
        <div>
          <h3 className="text-2xl font-heading font-bold text-white">AI Resume Rewriter</h3>
          <p className="text-text-muted text-sm">Transform your entire resume into a specific professional style.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 mb-8">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStyle(s.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              style === s.id 
                ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(0,229,255,0.1)]' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className={`font-bold text-sm ${style === s.id ? 'text-brand-primary' : 'text-white'}`}>{s.id}</div>
            <div className="text-[10px] text-text-muted mt-1 leading-tight">{s.desc}</div>
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
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-text-muted uppercase mb-2 ml-1">Original Text</label>
                <div className="flex-1 p-4 bg-white/5 border border-white/10 rounded-xl overflow-y-auto text-xs text-text-muted leading-relaxed h-[450px] max-h-[450px] scrollbar-thin scrollbar-thumb-white/20">
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
                        {copied ? <Check /> : <Copy />}
                        {copied ? 'Copied' : 'Copy Text'}
                    </button>
                </div>
                <div className="flex-1 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-xl overflow-y-auto text-xs text-white leading-relaxed h-[450px] max-h-[450px] scrollbar-thin scrollbar-thumb-brand-primary/30">
                  {formatResumeText(rewritten)}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
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
