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
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reset activeIndex when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setActiveIndex(-1);
        return;
      }

      if (!isOpen || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev < results.length - 1 ? prev + 1 : 0;
          resultRefs.current[next]?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev > 0 ? prev - 1 : results.length - 1;
          resultRefs.current[next]?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "Enter") {
        if (activeIndex >= 0 && activeIndex < results.length) {
          e.preventDefault();
          handleResultClick(results[activeIndex].slug);
        }
      }
    },
    [isOpen, results, activeIndex]
  );

  const handleResultClick = useCallback(
    (slug: string) => {
      setIsOpen(false);
      setActiveIndex(-1);
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
      className="relative pointer-events-auto"
      style={{ animation: "fade-in 0.5s ease-out 0.3s both" }}
    >
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Ask Deep Thought..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-label="포스트 검색"
          aria-activedescendant={
            activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
          }
          className="font-display w-72 md:w-96 h-10 rounded-full bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-zinc-600 tracking-wider outline-none focus:border-amber-400/50 focus:bg-white/10 focus:ring-1 focus:ring-amber-400/30 transition-all duration-200"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="search-results"
          role="listbox"
          aria-label="검색 결과"
          className="z-[40] absolute top-full mt-2 left-0 w-72 md:w-96 bg-zinc-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg shadow-black/50 max-h-80 overflow-y-auto p-2"
        >
          {results.length > 0 ? (
            results.map((result, index) => (
              <button
                key={result.slug}
                ref={(el) => {
                  resultRefs.current[index] = el;
                }}
                type="button"
                role="option"
                id={`search-result-${index}`}
                aria-selected={index === activeIndex}
                onClick={() => handleResultClick(result.slug)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  index === activeIndex
                    ? "bg-white/10"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-white truncate">
                    {result.title}
                  </span>
                  <span className="text-[10px] text-amber-400/70 shrink-0">
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
