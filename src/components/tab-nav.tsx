"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";

const tabs = [
  { href: "/", label: "Main", index: "01" },
  { href: "/tech", label: "Tech", index: "02" },
  { href: "/profile", label: "Profile", index: "03" },
  { href: "/portfolio", label: "Portfolio", index: "04" },
  { href: "/log", label: "Log", index: "05" },
];

const FOCUS_RING =
  "focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none";

const isTabActive = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

/** 데스크톱 nav와 모바일 헤더가 같은 워드마크를 쓴다 (여백만 다름) */
const Wordmark = ({ className = "" }: { className?: string }) => (
  <Link
    href="/"
    className={`font-display font-bold text-text-primary shrink-0 tracking-[0.15em] text-xs uppercase min-h-[44px] inline-flex items-center text-glow-accent-sm ${FOCUS_RING} ${className}`}
  >
    Deep Thought
  </Link>
);

const TabNav = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    },
    [isMenuOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <header
      className="sticky top-0 z-50 bg-[var(--bg-nav)] backdrop-blur-sm border-b border-border"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      {/* Desktop nav */}
      <nav
        aria-label="메인 네비게이션"
        className="hidden md:flex items-center gap-1 max-w-wide mx-auto px-4 h-12"
      >
        <Wordmark className="mr-4" />
        {tabs.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`font-display min-h-[44px] inline-flex items-center px-4 py-2 text-xs font-medium tracking-[0.1em] uppercase transition-colors duration-150 ${FOCUS_RING} ${
              isTabActive(href, pathname)
                ? "text-accent border-b-2 border-accent text-glow-accent-xs"
                : "text-text-muted hover:text-text-primary hover:bg-card"
            }`}
          >
            {label}
          </Link>
        ))}
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile header */}
      <div className="flex md:hidden items-center h-12 px-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-text-primary"
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={isMenuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
        <Wordmark className="ml-2" />
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <nav
          aria-label="모바일 네비게이션"
          className="md:hidden border-t border-border bg-[var(--bg-nav)] backdrop-blur-sm animate-drawer-slide-down"
        >
          {tabs.map(({ href, label, index }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-6 py-3 font-display text-sm tracking-[0.1em] uppercase transition-colors ${FOCUS_RING} ${
                isTabActive(href, pathname)
                  ? "text-accent bg-accent/5"
                  : "text-text-muted hover:text-text-primary hover:bg-card"
              }`}
            >
              <span className="text-text-muted/50 mr-3 text-[10px]">
                {index}
              </span>
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default TabNav;
