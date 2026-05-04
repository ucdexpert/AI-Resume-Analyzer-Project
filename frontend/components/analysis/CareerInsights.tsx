'use client';

import React from 'react';
import { CurrencyDollar, RoadHorizon, Info } from '@phosphor-icons/react';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { translations } from '../../lib/translations';

interface CareerInsightsProps {
  salary?: { range: string, currency: string, basis: string };
  careerPath?: { short_term: string | string[], long_term: string | string[] };
  industryFeedback?: string;
}

export default function CareerInsights({ salary, careerPath, industryFeedback }: CareerInsightsProps) {
  const { lang } = useLanguageStore();
  const t = translations[lang];

  // Helper to render career path text
  const renderCareerPath = (path: string | string[]) => {
    if (Array.isArray(path)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {path.map((item, i) => (
            <li key={i} className="text-text-primary">{item}</li>
          ))}
        </ul>
      );
    }
    return <p className="text-text-primary">{path}</p>;
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Salary Estimator */}
      {salary && (
        <div className="glass-card p-8 border-brand-primary/20">
          <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-3 text-brand-primary">
            <CurrencyDollar size={32} weight="duotone" />
            {t.salary}
          </h3>
          <div className="mb-4">
            <span className="text-4xl font-bold text-white">{salary.range}</span>
            <span className="text-text-muted ml-2">{salary.currency} / year</span>
          </div>
          <p className="text-sm text-text-muted flex items-start gap-2">
            <Info size={16} className="mt-1 flex-shrink-0" />
            {salary.basis || t.salaryBasis}
          </p>
        </div>
      )}

      {/* Career Path */}
      {careerPath && (
        <div className="glass-card p-8 border-brand-success/20">
          <h3 className="text-2xl font-heading font-bold mb-6 flex items-center gap-3 text-brand-success">
            <RoadHorizon size={32} weight="duotone" />
            {t.careerTrajectory}
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-brand-success uppercase tracking-wider mb-1">{t.shortTerm}</p>
              {renderCareerPath(careerPath.short_term)}
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-brand-success uppercase tracking-wider mb-1">{t.longTerm}</p>
              {renderCareerPath(careerPath.long_term)}
            </div>
          </div>
        </div>
      )}

      {/* Industry Feedback */}
      {industryFeedback && (
        <div className="md:col-span-2 glass-card p-8">
          <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">{t.industryFeedback}</h4>
          <p className="text-lg text-text-primary italic leading-relaxed">
            "{industryFeedback}"
          </p>
        </div>
      )}
    </div>
  );
}
