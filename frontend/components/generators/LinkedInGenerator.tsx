'use client';

import React, { useState, useEffect } from 'react';
import { generateLinkedInSummary } from '../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { LinkedinLogo, Copy, Check } from '@phosphor-icons/react';
import useAuthStore from '../../stores/useAuthStore';
import UpgradeModal from '../shared/UpgradeModal';
import api from '../../lib/api';

export default function LinkedInGenerator({ resumeText }: { resumeText: string }) {
  const { user } = useAuthStore();
  const isPro = user?.plan?.toLowerCase() === 'pro';

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [usageCount, setUsageCount] = useState<number | null>(null);

  // Fetch usage count for free users
  useEffect(() => {
    const fetchUsageCount = async () => {
      if (!isPro && user) {
        try {
          const response = await api.get('/usage/linkedin-count');
          setUsageCount(response.data.count || 0);
        } catch (error) {
          console.error('Failed to fetch usage count:', error);
          setUsageCount(0);
        }
      }
    };
    fetchUsageCount();
  }, [isPro, user]);

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

      // Increment usage count for free users
      if (!isPro && usageCount !== null) {
        setUsageCount(usageCount + 1);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setShowUpgradeModal(true);
      } else {
        alert("Failed to generate LinkedIn summary.");
      }
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
    <div className="glass-card p-4 sm:p-6 md:p-8">
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl sm:text-2xl font-heading font-bold flex items-center gap-2 sm:gap-3 text-brand-primary">
            <LinkedinLogo size={24} weight="fill" className="sm:hidden flex-shrink-0" />
            <LinkedinLogo size={32} weight="fill" className="hidden sm:block flex-shrink-0" />
            <span className="truncate">LinkedIn Summary Generator</span>
          </h3>
          {!isPro && usageCount !== null && (
            <p className="text-xs text-text-muted mt-1">
              Free tier: {usageCount}/3 generations used
            </p>
          )}
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="neon-button !py-2 !px-4 text-sm sm:text-base w-full sm:w-auto whitespace-nowrap"
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
