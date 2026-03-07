"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Main" },
  { href: "/tech", label: "Tech" },
  { href: "/portfolio", label: "Portfolio" },
];

const TabNav = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-sm border-b border-white/10">
      <nav aria-label="메인 네비게이션" className="flex items-center gap-1 max-w-5xl mx-auto px-4 h-12">
        <Link
          href="/"
          className="font-display font-bold text-white mr-4 shrink-0 rounded-sm tracking-[0.15em] text-xs uppercase focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none"
          style={{ textShadow: "0 0 10px rgba(245,158,11,0.3)" }}
        >
          Deep Thought
        </Link>
        {tabs.map(({ href, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`font-display min-h-[44px] inline-flex items-center px-4 py-2 text-xs font-medium tracking-[0.1em] uppercase rounded-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none ${
                isActive
                  ? "text-amber-400 border-b-2 border-amber-400"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
              style={isActive ? { textShadow: "0 0 8px rgba(245,158,11,0.3)" } : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};

export default TabNav;
