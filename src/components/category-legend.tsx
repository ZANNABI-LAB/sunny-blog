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
    <div className="absolute bottom-24 right-4 md:right-8 z-20 bg-[#070709]/70 backdrop-blur-sm border border-white/10 rounded-xl p-3 pointer-events-auto">
      <div className="flex flex-col gap-1">
        {categories.map((cat) => {
          const color = getCategoryColor(cat);
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => onToggle(isActive ? null : cat)}
              className={`flex items-center gap-2 px-3 py-2.5 min-h-[44px] min-w-[44px] rounded-lg cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:outline-none ${
                isActive ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{
                  backgroundColor: color,
                  boxShadow: isActive ? `0 0 8px ${color}` : "none",
                }}
              />
              <span
                className={`hidden md:inline text-xs transition-colors duration-200 ${
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
  );
};

export default CategoryLegend;
