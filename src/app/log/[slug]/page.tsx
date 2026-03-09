import { notFound } from "next/navigation";
import Link from "next/link";
import { getLogBySlug, getLogSlugs } from "@/lib/logs";
import CodeBlockEnhancer from "@/components/code-block-enhancer";

export const generateStaticParams = () => {
  return getLogSlugs().map((slug) => ({ slug }));
};

type Props = {
  params: Promise<{ slug: string }>;
};

const LogDetailPage = async ({ params }: Props) => {
  const { slug } = await params;
  const log = await getLogBySlug(slug);

  if (!log) notFound();

  return (
    <div className="max-w-3xl mx-auto animate-page-fade-in">
      <Link
        href="/log"
        className="font-display text-xs text-text-muted tracking-[0.15em] uppercase hover:text-accent transition-colors focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none"
      >
        &larr; Back to Log
      </Link>

      <header className="mt-6 mb-8">
        <h1 className="font-display text-3xl md:text-5xl font-bold text-text-primary tracking-tight text-glow-amber">
          {log.title}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <time className="font-display text-xs text-text-muted tracking-wider">
            {log.date}
          </time>
          {log.tags.length > 0 && (
            <div className="flex gap-2">
              {log.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-display text-accent/60 border border-accent/20 rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <article
        className="prose dark:prose-invert prose-amber max-w-none"
        dangerouslySetInnerHTML={{ __html: log.contentHtml }}
      />
      <CodeBlockEnhancer />
    </div>
  );
};

export default LogDetailPage;
