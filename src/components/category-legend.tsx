"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { getCategoryColor } from "@/lib/categories";

type CategoryLegendProps = {
  categories: string[];
  activeCategory: string | null;
  onToggle: (category: string | null) => void;
};

const CategoryLegend = ({
  categories,
  activeCategory,
  onToggle,
}: CategoryLegendProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);

  const updateFade = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const hasOverflow = scrollWidth > clientWidth + 1;
    setFadeLeft(hasOverflow && scrollLeft > 1);
    setFadeRight(hasOverflow && scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    updateFade();
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(updateFade);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateFade, categories, activeCategory]);

  // 선택된 항목이 보이도록 자동 스크롤
  useEffect(() => {
    if (!activeCategory || !scrollRef.current) return;
    const el = scrollRef.current;
    const activeBtn = el.querySelector(`[data-category="${activeCategory}"]`) as HTMLElement | null;
    if (activeBtn) {
      const btnLeft = activeBtn.offsetLeft;
      const btnWidth = activeBtn.offsetWidth;
      const elWidth = el.clientWidth;
      const scrollTarget = btnLeft - elWidth / 2 + btnWidth / 2;
      el.scrollTo({ left: scrollTarget, behavior: "smooth" });
    }
  }, [activeCategory]);

  const buildMaskImage = () => {
    if (!fadeLeft && !fadeRight) return undefined;
    const left = fadeLeft ? "transparent, black 16px" : "black, black 0px";
    const right = fadeRight ? "black calc(100% - 16px), transparent" : "black 100%, black 100%";
    return `linear-gradient(to right, ${left}, ${right})`;
  };

  const maskImage = buildMaskImage();

  return (
    <div className="absolute top-4 right-4 md:right-8 z-20 max-w-[calc(100vw-2rem)] pointer-events-auto">
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide bg-bg-primary/70 backdrop-blur-sm border border-border rounded-full px-2 py-1 md:px-3 md:py-1.5"
        onScroll={updateFade}
        style={maskImage ? { maskImage, WebkitMaskImage: maskImage } : undefined}
      >
        <div className="flex items-center gap-0.5 md:gap-1">
          {categories.map((cat) => {
            const color = getCategoryColor(cat);
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                data-category={cat}
                onClick={() => onToggle(isActive ? null : cat)}
                className={`flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2.5 py-1 md:py-1.5 min-h-[36px] md:min-h-[44px] rounded-full cursor-pointer transition-all duration-200 shrink-0 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none ${
                  isActive ? "bg-card-hover" : "hover:bg-card"
                }`}
              >
                <span
                  className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0 transition-shadow duration-200"
                  style={{
                    backgroundColor: color,
                    boxShadow: isActive ? `0 0 8px ${color}` : "none",
                  }}
                />
                <span
                  className={`text-[10px] md:text-[11px] transition-all duration-200 overflow-hidden whitespace-nowrap ${
                    isActive
                      ? "max-w-[100px] md:max-w-none opacity-100 text-text-primary"
                      : "max-w-0 md:max-w-none md:opacity-100 opacity-0 text-text-secondary"
                  }`}
                >
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryLegend;
