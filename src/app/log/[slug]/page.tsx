import { notFound } from "next/navigation";
import Link from "next/link";
import { getLogBySlug, getLogSlugs } from "@/lib/logs";

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
        className="font-display text-xs text-zinc-500 tracking-[0.15em] uppercase hover:text-amber-400 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:outline-none"
      >
        &larr; Back to Log
      </Link>

      <header className="mt-6 mb-8">
        <h1 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight text-glow-amber">
          {log.title}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <time className="font-display text-xs text-zinc-500 tracking-wider">
            {log.date}
          </time>
          {log.tags.length > 0 && (
            <div className="flex gap-2">
              {log.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-display text-amber-400/60 border border-amber-400/20 rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <article
        className="prose prose-invert prose-amber max-w-none"
        dangerouslySetInnerHTML={{ __html: log.contentHtml }}
      />
    </div>
  );
};

export default LogDetailPage;
