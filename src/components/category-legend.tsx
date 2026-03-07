"use client";

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
  return (
    <div className="absolute top-4 right-4 md:right-8 z-20 max-w-[calc(100vw-2rem)] pointer-events-auto">
      <div className="overflow-x-auto scrollbar-hide legend-scroll-fade bg-[#070709]/70 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5">
        <div className="flex items-center gap-1">
          {categories.map((cat) => {
            const color = getCategoryColor(cat);
            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => onToggle(isActive ? null : cat)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[44px] rounded-full cursor-pointer transition-all duration-200 shrink-0 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none ${
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: color,
                    boxShadow: isActive ? `0 0 8px ${color}` : "none",
                  }}
                />
                <span
                  className={`hidden md:inline text-[11px] transition-colors duration-200 ${
                    isActive ? "text-white" : "text-zinc-400"
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
