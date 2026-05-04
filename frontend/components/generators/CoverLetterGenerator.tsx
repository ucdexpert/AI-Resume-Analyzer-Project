'use client';

import React, { useState } from 'react';
import { generateCoverLetter } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Check } from '@phosphor-icons/react';
import useAuthStore from '../../stores/useAuthStore';
import UpgradeModal from '../shared/UpgradeModal';

export default function CoverLetterGenerator({ resumeText }: { resumeText: string }) {
  const { user } = useAuthStore();
  const isPro = user?.plan?.toLowerCase() === 'pro';
  
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }
    setLoading(true);
    try {
      const data = await generateCoverLetter(resumeText, jobTitle, companyName);
      
      let letterText = '';

      if (typeof data === 'string') {
        letterText = data;
      } else if (data && typeof data.cover_letter === 'string') {
        letterText = data.cover_letter;
      } else if (data && typeof data.cover_letter === 'object' && data.cover_letter !== null) {
        // AI might have nested it further
        letterText = data.cover_letter.content || data.cover_letter.text || JSON.stringify(data.cover_letter);
      } else if (data && typeof data === 'object') {
        // If data is the object and cover_letter is missing or not a string
        letterText = data.cover_letter || data.content || data.text || JSON.stringify(data);
      } else {
        letterText = 'Error: Could not parse cover letter.';
      }

      // If it's still an object (from the fallbacks above), stringify nicely or get first value
      if (typeof letterText === 'object' && letterText !== null) {
        letterText = Object.values(letterText)[0] as string;
      }

      setCoverLetter(String(letterText));
    } catch (err) {
      alert("Failed to generate cover letter.");
      console.error('Cover letter error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-8">
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-3 text-brand-primary">
        <FileText size={32} weight="duotone" />
        Cover Letter Generator
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        <form onSubmit={handleGenerate} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-text-muted mb-2">Job Title</label>
            <input
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full p-2 sm:p-3 bg-white/5 border border-white/10 rounded-lg text-text-primary text-sm outline-none focus:border-brand-primary/50"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-text-muted mb-2">Company Name</label>
            <input
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google"
              className="w-full p-2 sm:p-3 bg-white/5 border border-white/10 rounded-lg text-text-primary text-sm outline-none focus:border-brand-primary/50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="neon-button w-full text-sm sm:text-base"
          >
            {loading ? "Generating..." : "Generate Cover Letter"}
          </button>
        </form>

        <div className="relative">
          <AnimatePresence mode="wait">
            {coverLetter ? (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative h-full min-h-[300px]"
              >
                <textarea
                  readOnly
                  value={coverLetter}
                  className="w-full h-full p-4 bg-white/5 border border-white/10 rounded-lg text-text-muted text-sm leading-relaxed resize-none outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 p-2 bg-brand-primary/20 hover:bg-brand-primary/40 rounded-lg transition-colors text-brand-primary"
                >
                  {copied ? <Check size={20} weight="bold" /> : <Copy size={20} weight="bold" />}
                </button>
              </motion.div>
            ) : (
              <div className="h-full min-h-[300px] border border-white/10 border-dashed rounded-lg flex items-center justify-center text-text-muted text-sm px-6 text-center">
                Enter job details to generate a professional cover letter tailored to your resume.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
