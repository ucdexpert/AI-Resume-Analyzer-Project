'use client';

import React, { useState } from 'react';
import { generateLinkedInSummary } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkedinLogo, Copy, Check } from '@phosphor-icons/react';

export default function LinkedInGenerator({ resumeText }: { resumeText: string }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateLinkedInSummary(resumeText);
      
      let bioText = '';
      
      if (typeof data === 'string') {
        bioText = data;
      } else if (data && typeof data.linkedin_summary === 'string') {
        bioText = data.linkedin_summary;
      } else if (data && typeof data.linkedin_summary === 'object' && data.linkedin_summary !== null) {
        bioText = data.linkedin_summary.content || data.linkedin_summary.text || data.linkedin_summary.summary || JSON.stringify(data.linkedin_summary);
      } else if (data && typeof data === 'object') {
        bioText = data.linkedin_summary || data.content || data.text || data.summary || JSON.stringify(data);
      } else {
        bioText = 'Error: Could not generate LinkedIn bio.';
      }

      // Final object check
      if (typeof bioText === 'object' && bioText !== null) {
        bioText = Object.values(bioText)[0] as string;
      }

      setSummary(String(bioText));
    } catch (err) {
      alert("Failed to generate LinkedIn summary.");
      console.error('LinkedIn error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-heading font-bold flex items-center gap-3 text-brand-primary">
          <LinkedinLogo size={32} weight="fill" />
          LinkedIn Summary Generator
        </h3>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="neon-button !py-2 !px-4"
        >
          {loading ? "Generating..." : "Generate Bio"}
        </button>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {summary ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <textarea
                readOnly
                value={summary}
                className="w-full h-48 p-4 bg-white/5 border border-white/10 rounded-lg text-text-muted text-sm leading-relaxed resize-none outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="absolute top-4 right-4 p-2 bg-brand-primary/20 hover:bg-brand-primary/40 rounded-lg transition-colors text-brand-primary"
              >
                {copied ? <Check size={20} weight="bold" /> : <Copy size={20} weight="bold" />}
              </button>
            </motion.div>
          ) : (
            <div className="h-48 border border-white/10 border-dashed rounded-lg flex items-center justify-center text-text-muted text-sm px-6 text-center">
              Create a compelling LinkedIn 'About' section that highlights your top achievements.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
