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
      className={`group relative block rounded-lg border border-white/10 bg-white/5 post-card-glow brutal-accent hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none animate-stagger-in overflow-hidden ${
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
        <time className="font-display text-xs text-zinc-500 tracking-wider">
          {post.date}
        </time>
      </div>

      {/* Title */}
      <h2
        className={`mt-3 font-bold text-white transition-colors duration-150 group-hover:text-amber-400 ${
          featured
            ? "font-display text-xl md:text-2xl tracking-tight"
            : "text-lg"
        }`}
      >
        {post.title}
      </h2>

      {/* Summary */}
      {post.summary && (
        <p
          className={`mt-2 text-sm text-zinc-400 ${
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
              className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-zinc-400"
            >
              {tag}
            </span>
          ))}
          {post.tags.length > (featured ? 6 : 3) && (
            <span className="text-xs text-zinc-500">
              +{post.tags.length - (featured ? 6 : 3)}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

export default PostCard;
