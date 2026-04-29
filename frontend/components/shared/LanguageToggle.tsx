'use client';

import React from 'react';
import { useLanguageStore } from '../../stores/useLanguageStore';
import { Globe } from '@phosphor-icons/react';

export default function LanguageToggle() {
  const { lang, setLanguage } = useLanguageStore();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ur', label: 'اردو' },
    { code: 'ar', label: 'ع' }
  ];

  return (
    <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => setLanguage(l.code as any)}
          className={`px-1.5 py-0.5 text-[10px] md:px-3 md:py-1 md:text-xs rounded-md font-bold transition-all ${
            lang === l.code 
              ? 'bg-brand-primary text-black' 
              : 'text-text-muted hover:text-white'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
