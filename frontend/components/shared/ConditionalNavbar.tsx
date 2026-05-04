'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy load Navbar - only load when needed
const Navbar = dynamic(() => import('./Navbar'), {
  ssr: false,
  loading: () => null,
});

export default function ConditionalNavbar() {
  const pathname = usePathname();

  // Don't show navbar on auth pages and admin pages
  const hideNavbar = pathname?.startsWith('/admin') ||
                     pathname === '/login' ||
                     pathname === '/signup' ||
                     pathname === '/forgot-password' ||
                     pathname === '/reset-password';

  if (hideNavbar) return null;

  return <Navbar />;
}
