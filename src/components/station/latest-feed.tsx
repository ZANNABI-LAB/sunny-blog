import Link from "next/link";
import type { PostMeta } from "@/types/post";

type LatestFeedProps = {
  posts: PostMeta[];
  /** 전체 글 수 — 항목마다 붙는 일련번호를 역순으로 매기는 데 쓴다 */
  total: number;
  className?: string;
};

/** 최근 발행 — 정거장이 마지막으로 받은 송신 기록 */
const LatestFeed = ({ posts, total, className = "" }: LatestFeedProps) => (
  <div className={`flex w-full flex-col gap-2 ${className}`}>
    <p className="font-display text-caption tracking-[0.2em] text-accent">
      LATEST TRANSMISSION
    </p>
    <ul className="flex flex-col gap-1.5">
      {posts.map((post, i) => (
        <li key={post.slug}>
          <Link
            href={`/tech/${post.slug}`}
            className="group flex items-start gap-3 border-l-2 border-accent bg-bg-primary/78 px-3 py-2 backdrop-blur-[2px] transition-colors hover:bg-card-hover focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
          >
            <span className="font-display shrink-0 text-caption text-accent tabular-nums">
              {String(total - i).padStart(3, "0")}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <b className="line-clamp-2 text-sm font-medium leading-snug text-text-primary">
                {post.title}
              </b>
              <span className="font-display text-caption text-text-muted">
                {post.category.toUpperCase()} · {post.date.replace(/-/g, ".")}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default LatestFeed;
