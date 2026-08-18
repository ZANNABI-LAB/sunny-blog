import type { Metadata } from "next";
import { getAllLogs } from "@/lib/logs";
import LogListWithViews from "@/components/log-list-with-views";
import PageHeader from "@/components/page-header";

export const metadata: Metadata = {
  title: "Log",
  description: "TIL & Retrospectives — 매일 배운 것과 회고 기록",
  alternates: { canonical: "/log" },
};

const LogPage = () => {
  const logs = getAllLogs();

  return (
    <div className="max-w-wide mx-auto animate-page-fade-in space-y-12">
      <PageHeader title="LOG" subtitle="TIL & Retrospectives" />

      {logs.length === 0 ? (
        <p className="text-text-muted text-sm">아직 로그가 없습니다.</p>
      ) : (
        <LogListWithViews logs={logs} />
      )}
    </div>
  );
};

export default LogPage;
