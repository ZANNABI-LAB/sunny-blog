import Link from "next/link";
import type { PostMeta } from "@/types/post";
import { getCategoryColor } from "@/lib/categories";

type PostCardProps = {
  post: PostMeta;
  featured?: boolean;
  index?: number;
};

const PostCard = ({ post, featured = false, index = 0 }: PostCardProps) => {
  const categoryColor = getCategoryColor(post.category);

  return (
    <Link
      href={`/tech/${post.slug}`}
      className={`group relative block rounded-lg border border-border bg-card post-card-glow brutal-accent hover:bg-card-hover focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none animate-stagger-in overflow-hidden ${
        featured ? "bento-span-2 p-6 md:p-8" : "p-5"
      }`}
      style={
        {
          "--card-category-color": categoryColor,
          animationDelay: `${index * 80}ms`,
        } as React.CSSProperties
      }
    >
      {/* Category + Date */}
      <div className="flex items-center justify-between">
        <span
          className="rounded-md px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `${categoryColor}15`,
            color: categoryColor,
          }}
        >
          {post.category}
        </span>
        <time className="font-display text-xs text-text-muted tracking-wider">
          {post.date}
        </time>
      </div>

      {/* Title */}
      <h2
        className={`mt-3 font-bold text-text-primary transition-colors duration-150 group-hover:text-accent ${
          featured
            ? "text-xl md:text-2xl tracking-tight"
            : "text-lg"
        }`}
      >
        {post.title}
      </h2>

      {/* Summary */}
      {post.summary && (
        <p
          className={`mt-2 text-sm text-text-secondary ${
            featured ? "line-clamp-3" : "line-clamp-2"
          }`}
        >
          {post.summary}
        </p>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.slice(0, featured ? 6 : 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-card-hover px-2 py-0.5 text-xs text-text-secondary"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > (featured ? 6 : 3) && (
            <span className="text-xs text-text-muted">
              +{post.tags.length - (featured ? 6 : 3)}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

export default PostCard;
