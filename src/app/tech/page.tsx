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
    <div className="max-w-4xl mx-auto animate-page-fade-in" style={{ background: 'radial-gradient(ellipse at top, rgba(15,23,41,0.5) 0%, transparent 60%)' }}>
      <h1 className="text-2xl font-bold text-glow-indigo">Tech</h1>
      <p className="mt-2 text-zinc-400">
        기술 학습 기록과 개발 경험을 공유합니다.
      </p>

      <div className="mt-6">
        <Suspense fallback={null}>
          <CategoryFilter categories={activeCategories} counts={counts} />
        </Suspense>
      </div>

      {posts.length > 0 ? (
        <section className="mt-8 flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </section>
      ) : (
        <p className="py-16 text-center text-zinc-400">
          아직 작성된 포스트가 없습니다.
        </p>
      )}
    </div>
  );
};

export default TechPage;
