import type { Metadata } from "next";
import { getAllLogs } from "@/lib/logs";
import LogListWithViews from "@/components/log-list-with-views";

export const metadata: Metadata = {
  title: "Log",
  description: "TIL & Retrospectives — 매일 배운 것과 회고 기록",
  alternates: { canonical: "/log" },
};

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
        <LogListWithViews logs={logs} />
      )}
    </div>
  );
};

export default LogPage;
