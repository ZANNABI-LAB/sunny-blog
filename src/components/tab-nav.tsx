"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Main", index: "01" },
  { href: "/profile", label: "Profile", index: "02" },
  { href: "/portfolio", label: "Portfolio", index: "03" },
  { href: "/tech", label: "Tech", index: "04" },
  { href: "/log", label: "Log", index: "05" },
];

const TabNav = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && isMenuOpen) {
      setIsMenuOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <header
      className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-sm border-b border-white/10"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      {/* Desktop nav */}
      <nav
        aria-label="메인 네비게이션"
        className="hidden md:flex items-center gap-1 max-w-5xl mx-auto px-4 h-12"
      >
        <Link
          href="/"
          className="font-display font-bold text-white mr-4 shrink-0 rounded-sm tracking-[0.15em] text-xs uppercase focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none"
          style={{ textShadow: "0 0 10px rgba(245,158,11,0.3)" }}
        >
          Deep Thought
        </Link>
        {tabs.map(({ href, label }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`font-display min-h-[44px] inline-flex items-center px-4 py-2 text-xs font-medium tracking-[0.1em] uppercase rounded-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none ${
                isActive
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
              style={
                isActive
                  ? { textShadow: "0 0 8px rgba(245,158,11,0.3)" }
                  : undefined
              }
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile header */}
      <div className="flex md:hidden items-center h-12 px-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-white"
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
        <span
          className="font-display font-bold text-white ml-2 tracking-[0.15em] text-xs uppercase"
          style={{ textShadow: "0 0 10px rgba(245,158,11,0.3)" }}
        >
          Deep Thought
        </span>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <nav
          aria-label="모바일 네비게이션"
          className="md:hidden border-t border-white/10 bg-[#0a0a0f]/95 backdrop-blur-sm animate-drawer-slide-down"
        >
          {tabs.map(({ href, label, index }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-6 py-3 font-display text-sm tracking-[0.1em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none ${
                  isActive
                    ? "text-amber-400 bg-amber-400/5"
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-zinc-700 mr-3 text-[10px]">{index}</span>
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
};

export default TabNav;
