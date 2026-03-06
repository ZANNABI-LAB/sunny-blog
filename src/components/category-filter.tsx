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
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleClick(null)}
        className={`rounded-full px-3 py-1 text-sm font-medium border transition-colors duration-150 ${
          !activeCategory
            ? "bg-white/15 text-white border-white/30"
            : "bg-white/5 text-zinc-400 border-transparent hover:bg-white/10"
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
            className={`rounded-full px-3 py-1 text-sm font-medium border transition-colors duration-150 ${
              !isActive
                ? "bg-white/5 text-zinc-400 border-transparent hover:bg-white/10"
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
