import Link from "next/link";
import type { PostMeta } from "@/types/post";

type SeriesNavProps = {
  currentSlug: string;
  seriesTitle: string;
  posts: PostMeta[]; // getSeriesPosts 결과 (order 오름차순)
};

/**
 * 포스트 상세 상단의 시리즈 내비게이션.
 * 이론 글(자동 생성)과 실전 글(직접 작성)을 하나의 흐름으로 보여준다.
 */
const SeriesNav = ({ currentSlug, seriesTitle, posts }: SeriesNavProps) => {
  if (posts.length < 2) return null;

  return (
    <nav
      aria-label={`시리즈: ${seriesTitle}`}
      className="mb-8 rounded-lg border border-border bg-card p-4 md:p-5"
    >
      <p className="font-display text-xs tracking-[0.2em] uppercase text-text-muted">
        Series
      </p>
      <p className="mt-1 font-bold text-text-primary">{seriesTitle}</p>
      <ol className="mt-3 space-y-1.5">
        {posts.map((post) => {
          const isCurrent = post.slug === currentSlug;
          const label = post.source === "manual" ? "실전" : "이론";
          return (
            <li key={post.slug} className="flex items-center gap-2 text-sm">
              <span className="font-display text-xs text-text-muted w-5 shrink-0">
                {String(post.series!.order).padStart(2, "0")}
              </span>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-card-hover text-text-secondary shrink-0">
                {label}
              </span>
              {isCurrent ? (
                <span aria-current="page" className="text-accent font-medium truncate">
                  {post.title}
                </span>
              ) : (
                <Link
                  href={`/tech/${post.slug}`}
                  className="text-text-secondary hover:text-text-primary truncate focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none rounded"
                >
                  {post.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default SeriesNav;
