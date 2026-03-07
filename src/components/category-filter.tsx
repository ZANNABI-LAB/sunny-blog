"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { getCategoryColor } from "@/lib/categories";

type CategoryFilterProps = {
  categories: string[];
  counts: Record<string, number>;
};

const CategoryFilter = ({ categories, counts }: CategoryFilterProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get("category");

  const totalCount = Object.values(counts).reduce((sum, c) => sum + c, 0);

  const handleClick = (category: string | null) => {
    if (category) {
      router.push(`/tech?category=${encodeURIComponent(category)}`);
    } else {
      router.push("/tech");
    }
  };

  return (
    <div role="group" aria-label="카테고리 필터" className="flex flex-wrap gap-2">
      <button
        onClick={() => handleClick(null)}
        aria-pressed={!activeCategory}
        className={`min-h-[44px] rounded-full px-3 py-2 text-sm font-medium border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none ${
          !activeCategory
            ? "bg-card-hover text-text-primary border-border"
            : "bg-card text-text-secondary border-transparent hover:bg-card-hover"
        }`}
      >
        전체 ({totalCount})
      </button>
      {categories.map((cat) => {
        const color = getCategoryColor(cat);
        const isActive = activeCategory === cat;

        return (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            aria-pressed={isActive}
            className={`min-h-[44px] rounded-full px-3 py-2 text-sm font-medium border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none ${
              !isActive
                ? "bg-card text-text-secondary border-transparent hover:bg-card-hover"
                : ""
            }`}
            style={
              isActive
                ? {
                    backgroundColor: `${color}15`,
                    color,
                    borderColor: `${color}30`,
                  }
                : undefined
            }
          >
            {cat} ({counts[cat] ?? 0})
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
