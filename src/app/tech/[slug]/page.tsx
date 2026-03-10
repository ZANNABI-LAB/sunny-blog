import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import { getCategoryColor } from "@/lib/categories";
import CodeBlockEnhancer from "@/components/code-block-enhancer";

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
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category)}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: "Deep Thought" },
  };

  return (
    <div className="max-w-4xl mx-auto animate-page-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* BackLink */}
      <Link
        href="/tech"
        className="text-text-secondary transition-colors duration-150 hover:text-text-primary"
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
            boxShadow: `0 0 8px ${categoryColor}30`,
          }}
        >
          {post.category}
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-text-primary sm:text-3xl tracking-tight text-glow-amber-sm">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-secondary font-display tracking-wider">
          <time dateTime={post.date}>{formatDateKo(post.date)}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.author}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-card-hover px-2 py-0.5 text-xs text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Divider */}
      <div className="mt-8 border-t border-border pt-8" />

      {/* PostBody */}
      <article
        className="prose dark:prose-invert max-w-none prose-headings:text-text-primary prose-headings:font-bold prose-a:text-accent-secondary prose-a:no-underline hover:prose-a:opacity-80 prose-code:text-accent-secondary prose-code:bg-card-hover prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-bg-elevated prose-pre:border prose-pre:border-border prose-blockquote:border-accent-secondary/50 prose-hr:border-border prose-strong:text-text-primary"
        style={{ '--category-color': categoryColor } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
      <CodeBlockEnhancer />

      {/* References */}
      {hasReferences && (
        <section className="mt-12 pt-6">
          <div
            className="mb-6"
            style={{
              background: `linear-gradient(to right, transparent, ${categoryColor}40, transparent)`,
              height: '1px',
            }}
          />
          <h2 className="font-display text-sm font-bold text-text-secondary tracking-wider uppercase">References</h2>
          <ul className="mt-3 space-y-2">
            {showSourceUrl && (
              <li>
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent-secondary break-all transition-colors duration-150 hover:opacity-80"
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
                  className="text-sm text-accent-secondary break-all transition-colors duration-150 hover:opacity-80"
                >
                  {formatUrl(url)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 하단 목록 링크 */}
      <div className="mt-12 border-t border-border pt-6 pb-8">
        <Link
          href="/tech"
          className="text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
        >
          &larr; 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default PostDetailPage;
