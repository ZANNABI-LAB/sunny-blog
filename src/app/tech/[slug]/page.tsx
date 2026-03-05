import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";

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

  return (
    <div>
      {/* BackLink */}
      <Link
        href="/tech"
        className="text-zinc-400 transition-colors duration-150 hover:text-white"
      >
        &larr; 목록으로
      </Link>

      {/* PostHeader */}
      <header className="mt-6">
        <span className="rounded-md bg-indigo-400/10 px-2 py-0.5 text-xs font-medium text-indigo-400">
          {post.category}
        </span>
        <h1 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <time dateTime={post.date}>{post.date}</time>
          {post.sourceUrl && (
            <>
              <span aria-hidden="true">&middot;</span>
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 transition-colors duration-150 hover:text-indigo-300"
              >
                {post.source ?? "출처"}
              </a>
            </>
          )}
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
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </div>
  );
};

export default PostDetailPage;
