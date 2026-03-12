"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { getCategoryColor, getCategoryRoot, getCategorySub } from "@/lib/categories";

type CategoryFilterProps = {
  categories: string[];
  counts: Record<string, number>;
  subCategories: Record<string, string[]>;
  subCounts: Record<string, number>;
};

const CategoryFilter = ({
  categories,
  counts,
  subCategories,
  subCounts,
}: CategoryFilterProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCategory = searchParams.get("category");

  const totalCount = Object.values(counts).reduce((sum, c) => sum + c, 0);

  // Determine active root category
  const activeRoot = activeCategory
    ? getCategoryRoot(activeCategory)
    : null;

  // Whether the active category is a sub-category
  const isSubActive = activeCategory ? activeCategory.includes(".") : false;

  const handleClick = (category: string | null) => {
    if (category) {
      router.push(`/tech?category=${encodeURIComponent(category)}`);
    } else {
      router.push("/tech");
    }
  };

  // Get sub-categories for the active root
  const activeSubs = activeRoot ? subCategories[activeRoot] ?? [] : [];

  return (
    <div role="group" aria-label="카테고리 필터">
      {/* 1단: root 카테고리 */}
      <div className="flex flex-wrap gap-2">
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
          const isActive = activeRoot === cat;

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

      {/* 2단: 서브카테고리 (활성 root에 서브가 있을 때만) */}
      {activeRoot && activeSubs.length > 0 && (
        <div className="mt-2 pl-2 flex flex-wrap gap-1.5 animate-stagger-in">
          {/* "전체 {Root}" 칩 */}
          <button
            onClick={() => handleClick(activeRoot)}
            aria-pressed={activeCategory === activeRoot}
            className={`min-h-[36px] rounded-full px-2.5 py-1 text-xs font-medium border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none ${
              !isSubActive
                ? ""
                : "bg-card text-text-secondary border-transparent hover:bg-card-hover"
            }`}
            style={
              !isSubActive
                ? {
                    backgroundColor: `${getCategoryColor(activeRoot)}15`,
                    color: getCategoryColor(activeRoot),
                    borderColor: `${getCategoryColor(activeRoot)}30`,
                  }
                : undefined
            }
          >
            전체 {activeRoot} ({counts[activeRoot] ?? 0})
          </button>
          {activeSubs.map((sub) => {
            const subName = getCategorySub(sub);
            const color = getCategoryColor(sub);
            const isActive = activeCategory === sub;

            return (
              <button
                key={sub}
                onClick={() => handleClick(sub)}
                aria-pressed={isActive}
                className={`min-h-[36px] rounded-full px-2.5 py-1 text-xs font-medium border transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none ${
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
                {subName} ({subCounts[sub] ?? 0})
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
