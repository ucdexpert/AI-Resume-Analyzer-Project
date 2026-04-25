import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'ur' | 'ar';

interface LanguageState {
  lang: Language;
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: 'en',
      direction: 'ltr',
      setLanguage: (lang) => set({ 
        lang, 
        direction: lang === 'en' ? 'ltr' : 'rtl' 
      }),
    }),
    {
      name: 'language-storage',
    }
  )
);
