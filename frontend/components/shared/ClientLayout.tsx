'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            router.push('/dashboard');
            break;
          case 'b':
            e.preventDefault();
            router.push('/builder');
            break;
          case 'h':
            e.preventDefault();
            router.push('/dashboard');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return <>{children}</>;
}
