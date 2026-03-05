import Link from "next/link";
import type { PostMeta } from "@/types/post";

type PostCardProps = {
  post: PostMeta;
};

const PostCard = ({ post }: PostCardProps) => {
  return (
    <Link
      href={`/tech/${post.slug}`}
      className="block group rounded-lg border border-white/10 bg-white/5 p-5 transition-colors duration-150 hover:border-white/20 hover:bg-white/10"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-md bg-indigo-400/10 px-2 py-0.5 text-xs font-medium text-indigo-400">
          {post.category}
        </span>
        <time className="text-sm text-zinc-400">{post.date}</time>
      </div>

      <h2 className="mt-3 text-lg font-semibold text-white transition-colors duration-150 group-hover:text-indigo-400">
        {post.title}
      </h2>

      {post.summary && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
          {post.summary}
        </p>
      )}

      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
};

export default PostCard;
