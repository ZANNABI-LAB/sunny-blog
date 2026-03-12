"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LogMeta } from "@/types/log";
import ViewBadge from "@/components/view-badge";

type LogListWithViewsProps = {
  logs: LogMeta[];
};

const LogListWithViews = ({ logs }: LogListWithViewsProps) => {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (logs.length === 0) return;

    const fetchViewCounts = async () => {
      try {
        const slugs = logs.map((l) => `log/${l.slug}`).join(",");
        const res = await fetch(
          `/api/views?slugs=${encodeURIComponent(slugs)}`
        );
        const data = await res.json();
        setViewCounts(data.views ?? {});
      } catch (err) {
        console.error("LogListWithViews error:", err);
      }
    };

    fetchViewCounts();
  }, [logs]);

  return (
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
            <div className="flex items-center gap-2 shrink-0">
              <time className="font-display text-[10px] text-text-muted tracking-wider">
                {log.date}
              </time>
              {viewCounts[`log/${log.slug}`] !== undefined && (
                <>
                  <span className="text-text-muted" aria-hidden="true">
                    &middot;
                  </span>
                  <ViewBadge viewCount={viewCounts[`log/${log.slug}`]} />
                </>
              )}
            </div>
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
  );
};

export default LogListWithViews;
