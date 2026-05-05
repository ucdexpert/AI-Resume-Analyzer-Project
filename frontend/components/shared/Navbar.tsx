"use client";
import useAuthStore from "../../stores/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  List,
  X,
  SignOut,
  User,
  Layout,
  FileText,
  House,
  ChatText,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import SupportModal from "./SupportModal";

export default function Navbar() {
  const { user, isLoggedIn, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/10 px-4 sm:px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-brand-primary/10 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-brand-primary/10 group-hover:scale-105 transition-transform relative">
              <Image
                src="/logo-image.png"
                alt="SkillSense Logo"
                width={64}
                height={64}
                priority
                quality={85}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-white text-lg sm:text-xl md:text-2xl whitespace-nowrap font-heading tracking-tight">
              Skill<span className="text-brand-primary">Sense</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {isLoggedIn && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-text-muted hover:text-white transition-colors flex items-center gap-2"
                  >
                    <Layout size={20} />
                    Dashboard
                  </Link>
                  <Link
                    href="/builder"
                    className="text-text-muted hover:text-white transition-colors flex items-center gap-2"
                  >
                    <FileText size={20} />
                    Builder
                  </Link>
                </>
              )}
              <Link href="/about" className="text-text-muted hover:text-white transition-colors">About</Link>
              <Link href="/pricing" className="text-text-muted hover:text-white transition-colors">Pricing</Link>
              <Link href="/blog" className="text-text-muted hover:text-white transition-colors">Blog</Link>
              <Link href="/faq" className="text-text-muted hover:text-white transition-colors">FAQ</Link>
              <Link href="/contact" className="text-text-muted hover:text-white transition-colors">Contact</Link>
            </div>

            <div className="h-6 w-px bg-white/10 mx-2" />

            <div className="flex items-center gap-4">
              <LanguageToggle />
              <ThemeToggle />

              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="w-6 h-6 bg-brand-primary/20 rounded-full flex items-center justify-center">
                      <User size={14} className="text-brand-primary" />
                    </div>
                    <span className="text-sm text-text-primary font-medium">
                      {user?.name}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-text-muted hover:text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-all"
                    title="Logout"
                  >
                    <SignOut size={22} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href="/login"
                    className="text-text-muted hover:text-white transition-colors px-4 py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-brand-primary/20"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white z-[60] relative"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex flex-col p-6 pt-24 overflow-y-auto">
          {/* Nav Links */}
          <nav className="flex flex-col gap-4 mb-8">
            {isLoggedIn && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-lg font-medium flex items-center gap-3 py-2 hover:text-brand-primary transition-colors"
                >
                  <Layout size={24} weight="duotone" />
                  Dashboard
                </Link>
                <Link
                  href="/builder"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-lg font-medium flex items-center gap-3 py-2 hover:text-brand-primary transition-colors"
                >
                  <FileText size={24} weight="duotone" />
                  Builder
                </Link>
              </>
            )}
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white text-lg font-medium py-2 hover:text-brand-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white text-lg font-medium py-2 hover:text-brand-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white text-lg font-medium py-2 hover:text-brand-primary transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white text-lg font-medium py-2 hover:text-brand-primary transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white text-lg font-medium py-2 hover:text-brand-primary transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Language & Theme Toggle */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          {/* User Section or Auth Buttons */}
          {isLoggedIn ? (
            <div className="mt-auto border-t border-white/10 pt-6">
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 mb-4"
              >
                <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <User size={20} className="text-brand-primary" weight="duotone" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{user?.name}</p>
                  <p className="text-text-muted text-sm">{user?.email}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl py-3 font-bold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
              >
                <SignOut size={20} weight="bold" />
                Logout
              </button>
            </div>
          ) : (
            <div className="mt-auto flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-3 border border-white/10 rounded-xl text-white font-bold hover:bg-white/5 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-3 bg-brand-primary rounded-xl text-black font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </>
  );
}
