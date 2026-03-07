import Link from "next/link";
import { getAllLogs } from "@/lib/logs";

const LogPage = () => {
  const logs = getAllLogs();

  return (
    <div className="max-w-4xl mx-auto animate-page-fade-in space-y-12">
      <header>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-text-primary tracking-tight text-glow-amber">
          LOG
        </h1>
        <p className="mt-2 font-display text-xs text-text-muted tracking-[0.2em] uppercase">
          TIL &amp; Retrospectives
        </p>
      </header>

      {logs.length === 0 ? (
        <p className="text-text-muted text-sm">아직 로그가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log, i) => (
            <Link
              key={log.slug}
              href={`/log/${log.slug}`}
              className="block border border-border rounded-lg p-5 bg-card hover:border-accent/30 transition-colors group animate-stagger-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-base text-text-primary tracking-wider group-hover:text-accent transition-colors">
                  {log.title}
                </h2>
                <time className="font-display text-[10px] text-text-muted tracking-wider shrink-0">
                  {log.date}
                </time>
              </div>
              {log.summary && (
                <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                  {log.summary}
                </p>
              )}
              {log.tags.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogPage;
