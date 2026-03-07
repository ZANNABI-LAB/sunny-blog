import { Suspense } from "react";
import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/post-card";
import CategoryFilter from "@/components/category-filter";
import { getCategoryRoot, CATEGORIES } from "@/lib/categories";

type TechPageProps = {
  searchParams: Promise<{ category?: string }>;
};

const TechPage = async ({ searchParams }: TechPageProps) => {
  const { category } = await searchParams;
  const allPosts = getAllPosts();

  // Calculate counts per category
  const counts: Record<string, number> = {};
  for (const post of allPosts) {
    const root = getCategoryRoot(post.category);
    counts[root] = (counts[root] ?? 0) + 1;
  }

  // Only show categories that have posts, sorted by CATEGORIES order
  const activeCategories = CATEGORIES.filter((c) => (counts[c] ?? 0) > 0);

  // Filter posts by category if specified
  const posts = category
    ? allPosts.filter((p) => getCategoryRoot(p.category) === category)
    : allPosts;

  return (
    <div
      className="max-w-5xl mx-auto"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(15,23,41,0.5) 0%, transparent 60%)",
      }}
    >
      {/* Brutal Header */}
      <div className="animate-brutal-slide">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight text-glow-amber">
          TECH
        </h1>
        <p className="mt-2 font-display text-xs text-zinc-500 tracking-[0.2em] uppercase">
          {allPosts.length} posts &mdash; knowledge archive
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={null}>
          <CategoryFilter categories={activeCategories} counts={counts} />
        </Suspense>
      </div>

      {posts.length > 0 ? (
        <section className="mt-10 bento-grid">
          {posts.map((post, i) => (
            <PostCard
              key={post.slug}
              post={post}
              featured={i === 0}
              index={i}
            />
          ))}
        </section>
      ) : (
        <p className="py-16 text-center text-zinc-400 font-display text-sm tracking-wider">
          NO POSTS FOUND
        </p>
      )}
    </div>
  );
};

export default TechPage;
