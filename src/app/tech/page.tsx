import { Suspense } from "react";
import { getAllPosts } from "@/lib/posts";
import CategoryFilter from "@/components/category-filter";
import Pagination from "@/components/pagination";
import {
  getCategoryRoot,
  getSubCategories,
  CATEGORIES,
} from "@/lib/categories";
import SidebarLayout from "@/components/sidebar-layout";
import PostListWithViews from "@/components/post-list-with-views";

const POSTS_PER_PAGE = 9;

type TechPageProps = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

const TechPage = async ({ searchParams }: TechPageProps) => {
  const { category, page } = await searchParams;
  const allPosts = getAllPosts();

  // Calculate counts per root category
  const counts: Record<string, number> = {};
  for (const post of allPosts) {
    const root = getCategoryRoot(post.category);
    counts[root] = (counts[root] ?? 0) + 1;
  }

  // Only show categories that have posts, sorted by CATEGORIES order
  const activeCategories = CATEGORIES.filter((c) => (counts[c] ?? 0) > 0);

  // Build sub-categories map and sub-counts
  const subCategoriesMap: Record<string, string[]> = {};
  const subCounts: Record<string, number> = {};
  for (const cat of activeCategories) {
    const subs = getSubCategories(allPosts, cat);
    if (subs.length > 0) {
      subCategoriesMap[cat] = subs;
      for (const sub of subs) {
        subCounts[sub] = allPosts.filter((p) => p.category === sub).length;
      }
    }
  }

  // Filter posts by category (supports dot notation for sub-categories)
  const filteredPosts = category
    ? allPosts.filter((p) =>
        category.includes(".")
          ? p.category === category
          : getCategoryRoot(p.category) === category
      )
    : allPosts;

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE) || 1;
  const currentPage = Math.min(
    Math.max(1, Number(page) || 1),
    totalPages
  );
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  // Build basePath for pagination links
  const basePath = category
    ? `/tech?category=${encodeURIComponent(category)}`
    : "/tech";

  // Header text
  const headerText =
    totalPages > 1
      ? `${filteredPosts.length} posts \u2014 page ${currentPage} of ${totalPages}`
      : `${filteredPosts.length} posts \u2014 knowledge archive`;

  return (
    <SidebarLayout adSlot="tech-list">
      <div>
        {/* Brutal Header */}
        <div className="animate-brutal-slide">
          <h1 className="font-display text-5xl md:text-7xl font-bold text-text-primary tracking-tight text-glow-amber">
            TECH
          </h1>
          <p className="mt-2 font-display text-xs text-text-muted tracking-[0.2em] uppercase">
            {headerText}
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={null}>
            <CategoryFilter
              categories={activeCategories}
              counts={counts}
              subCategories={subCategoriesMap}
              subCounts={subCounts}
            />
          </Suspense>
        </div>

        {paginatedPosts.length > 0 ? (
          <>
            <PostListWithViews
              posts={paginatedPosts}
              showFeatured={currentPage === 1}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={basePath}
            />
          </>
        ) : (
          <p className="py-16 text-center text-text-secondary font-display text-sm tracking-wider">
            NO POSTS FOUND
          </p>
        )}
      </div>
    </SidebarLayout>
  );
};

export default TechPage;
