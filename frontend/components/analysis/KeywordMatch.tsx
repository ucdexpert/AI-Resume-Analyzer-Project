'use client';

import React from 'react';
import { Tag, MagnifyingGlass } from '@phosphor-icons/react';

interface KeywordGroupProps {
  title: string;
  keywords: string[];
  type: 'missing' | 'matched';
}

export default function KeywordMatch({ missing, matched }: { missing: any, matched?: string[] }) {
  return (
    <div className="glass-card p-8">
      <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-3 text-brand-primary">
        <Tag size={32} weight="duotone" />
        Keyword Analysis
      </h3>

      <div className="space-y-8">
        {/* Matched Keywords (If Job Description provided) */}
        {matched && matched.length > 0 && (
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-brand-success mb-3 flex items-center gap-2">
              <CheckCircle size={16} weight="bold" />
              Matched Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {matched.map(kw => (
                <span key={kw} className="px-3 py-1 rounded-md bg-brand-success/10 text-brand-success border border-brand-success/20 text-sm">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Keywords by Category */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-brand-danger mb-4 flex items-center gap-2">
            <MagnifyingGlass size={16} weight="bold" />
            Missing Keywords
          </h4>
          
          <div className="grid md:grid-cols-3 gap-6">
            <KeywordCategory title="Technical Skills" keywords={missing.technical_skills} />
            <KeywordCategory title="Soft Skills" keywords={missing.soft_skills} />
            <KeywordCategory title="Industry Terms" keywords={missing.industry_terms} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KeywordCategory({ title, keywords }: { title: string, keywords: string[] }) {
  if (!keywords || keywords.length === 0) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-text-muted">{title}</p>
      <div className="flex flex-wrap gap-2">
        {keywords.map(kw => (
          <span key={kw} className="px-2 py-0.5 rounded bg-white/5 text-text-muted border border-white/10 text-xs">
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
}

import { CheckCircle } from '@phosphor-icons/react';
