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
        <Link href="/" className="font-bold text-white mr-4 shrink-0 rounded-sm focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:outline-none">
          Sunny&apos;s Blog
        </Link>
        {tabs.map(({ href, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`min-h-[44px] inline-flex items-center px-4 py-2 text-sm font-medium rounded-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:outline-none ${
                isActive
                  ? "text-white border-b-2 border-indigo-400"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
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
