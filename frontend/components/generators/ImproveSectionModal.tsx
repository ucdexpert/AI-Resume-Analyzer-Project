'use client';

import React, { useState } from 'react';
import { improveSection } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicWand, X, Copy, Check } from '@phosphor-icons/react';

export default function ImproveSectionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [sectionName, setSectionName] = useState('Professional Summary');
  const [currentText, setCurrentText] = useState('');
  const [improvedText, setImprovedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleImprove = async () => {
    if (!currentText) return;
    setLoading(true);
    try {
      const data = await improveSection(currentText, sectionName);
      setImprovedText(data.improved_text);
    } catch (err) {
      alert("Failed to improve section.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-primary/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl glass-card border-brand-primary/20 p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-heading font-bold flex items-center gap-3 text-brand-primary">
            <MagicWand size={32} weight="duotone" />
            AI Resume Improver
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full flex items-center justify-center">
            <X size={24} />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Section to Improve</label>
              <select 
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full bg-[#1a1a2e] text-white border 
  border-white/20 rounded-lg px-4 py-3 outline-none 
  cursor-pointer focus:border-brand-primary"
  style={{ colorScheme: 'dark' }}
              >
                <option>Professional Summary</option>
                <option>Work Experience</option>
                <option>Projects</option>
                <option>Skills Section</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Current Text</label>
              <textarea
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                placeholder="Paste the weak section of your resume here..."
                className="w-full h-64 p-4 bg-white/5 border border-white/10 rounded-lg text-text-primary outline-none focus:border-brand-primary/50 resize-none"
              />
            </div>
            <button
              onClick={handleImprove}
              disabled={loading || !currentText}
              className="neon-button w-full"
            >
              {loading ? "Rewriting with AI..." : "Improve with AI"}
            </button>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-text-muted mb-2">AI Improved Version</label>
            <div className="relative h-full min-h-[300px]">
              {improvedText ? (
                <>
                  <textarea
                    readOnly
                    value={improvedText}
                    className="w-full h-[320px] p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg text-text-primary text-sm leading-relaxed resize-none outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(improvedText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="absolute top-4 right-4 p-2 bg-brand-primary/20 hover:bg-brand-primary/40 rounded-lg transition-colors text-brand-primary"
                  >
                    {copied ? <Check size={20} weight="bold" /> : <Copy size={20} weight="bold" />}
                  </button>
                </>
              ) : (
                <div className="h-[320px] border border-white/10 border-dashed rounded-lg flex items-center justify-center text-text-muted text-sm px-6 text-center">
                  Your AI-improved text will appear here. We use strong action verbs and metrics to make it stand out.
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
