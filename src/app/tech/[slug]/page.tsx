import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { getCategoryColor } from "@/lib/categories";

export const generateStaticParams = async () => {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.summary,
  };
};

/**
 * URL을 hostname + pathname 형식으로 표시한다.
 * 파싱 실패 시 원본 URL을 반환한다.
 */
const formatUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.replace(/\/$/, "");
    return `${parsed.hostname}${pathname}`;
  } catch {
    return url;
  }
};

/**
 * 날짜를 한국어 형식으로 변환한다.
 * "2025-12-15" -> "2025년 12월 15일"
 */
const formatDateKo = (dateStr: string): string => {
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return dateStr;
  const [, year, month, day] = match;
  return `${year}년 ${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;
};

/**
 * maeil-mail.kr URL인지 확인한다.
 */
const isMaeilMailUrl = (url: string): boolean => url.includes("maeil-mail.kr");

const PostDetailPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const categoryColor = getCategoryColor(post.category);

  // References: maeil-mail.kr URL 필터링
  const showSourceUrl = post.sourceUrl && !isMaeilMailUrl(post.sourceUrl);
  const filteredReferences = post.references.filter(
    (url) => !isMaeilMailUrl(url)
  );
  const hasReferences = showSourceUrl || filteredReferences.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* BackLink */}
      <Link
        href="/tech"
        className="text-zinc-400 transition-colors duration-150 hover:text-white"
      >
        &larr; 목록으로
      </Link>

      {/* PostHeader */}
      <header className="mt-6">
        <span
          className="rounded-md px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: `${categoryColor}15`,
            color: categoryColor,
          }}
        >
          {post.category}
        </span>
        <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <time dateTime={post.date}>{formatDateKo(post.date)}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.author}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
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
      </header>

      {/* Divider */}
      <div className="mt-8 border-t border-white/10 pt-8" />

      {/* PostBody */}
      <article
        className="prose prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:text-indigo-300 prose-code:text-indigo-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-[#161b22] prose-pre:border prose-pre:border-white/10 prose-blockquote:border-indigo-400/50 prose-hr:border-white/10 prose-strong:text-white"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* References */}
      {hasReferences && (
        <section className="mt-12 border-t border-white/10 pt-6">
          <h2 className="text-sm font-semibold text-zinc-300">References</h2>
          <ul className="mt-3 space-y-2">
            {showSourceUrl && (
              <li>
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 break-all transition-colors duration-150 hover:text-indigo-300"
                >
                  {post.source ?? "출처"}
                </a>
              </li>
            )}
            {filteredReferences.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-400 break-all transition-colors duration-150 hover:text-indigo-300"
                >
                  {formatUrl(url)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 하단 목록 링크 */}
      <div className="mt-12 border-t border-white/10 pt-6 pb-8">
        <Link
          href="/tech"
          className="text-sm text-zinc-400 transition-colors duration-150 hover:text-white"
        >
          &larr; 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default PostDetailPage;
