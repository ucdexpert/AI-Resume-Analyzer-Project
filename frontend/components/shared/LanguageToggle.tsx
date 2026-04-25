'use client';

import React from 'react';
import { useLanguageStore } from '@/stores/useLanguageStore';
import { Globe } from '@phosphor-icons/react';

export default function LanguageToggle() {
  const { lang, setLanguage } = useLanguageStore();

  return (
    <div className="flex items-center gap-2 p-1 glass-card border-white/5">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'en' ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-white'}`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ur')}
        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'ur' ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-white'}`}
      >
        اردو
      </button>
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${lang === 'ar' ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-white'}`}
      >
        العربية
      </button>
    </div>
  );
}
