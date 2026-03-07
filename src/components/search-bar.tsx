"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/types/search";

const DEBOUNCE_MS = 300;

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoading(true);

      try {
        const response = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const data = await response.json();
        if (!controller.signal.aborted) {
          setResults(data.results ?? []);
          setIsOpen(true);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        console.error("Search error:", err);
        if (!controller.signal.aborted) {
          setResults([]);
          setIsOpen(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  // Outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // ESC key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    []
  );

  const handleResultClick = useCallback(
    (slug: string) => {
      setIsOpen(false);
      router.push(`/tech/${slug}`);
    },
    [router]
  );

  const formatScore = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };

  return (
    <div
      ref={wrapperRef}
      className="mt-4 relative pointer-events-auto"
      style={{ animation: "fade-in 0.5s ease-out 0.3s both" }}
    >
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-72 md:w-96 h-10 rounded-full bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-400/50 focus:bg-white/10 focus:ring-1 focus:ring-indigo-400/30 transition-all duration-200"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="z-[40] absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 md:w-96 bg-zinc-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg shadow-black/50 max-h-80 overflow-y-auto p-2">
          {results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.slug}
                type="button"
                onClick={() => handleResultClick(result.slug)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white truncate">
                    {result.title}
                  </span>
                  <span className="text-[10px] text-indigo-400/70 shrink-0">
                    {formatScore(result.score)}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                  {result.summary}
                </p>
              </button>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-zinc-400">
              검색 결과가 없습니다
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
