"use client";

import { useEffect, useState } from "react";

type VisitorStatsProps = {
  className?: string;
};

const formatNumber = (n: number): string =>
  new Intl.NumberFormat("en").format(n);

const VisitorStats = ({ className }: VisitorStatsProps) => {
  const [stats, setStats] = useState<{ daily: number; total: number } | null>(
    null
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    const recordAndFetch = async () => {
      // 세션 내 중복 POST 방지
      if (!sessionStorage.getItem("visited_today")) {
        try {
          await fetch("/api/stats", { method: "POST" });
          sessionStorage.setItem("visited_today", "1");
        } catch (err) {
          console.error("VisitorStats record error:", err);
        }
      }

      // 통계 조회 (POST 실패와 무관하게 실행)
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats({ daily: data.daily ?? 0, total: data.total ?? 0 });
      } catch (err) {
        console.error("VisitorStats fetch error:", err);
        setError(true);
      }
    };

    recordAndFetch();
  }, []);

  if (error) return null;

  return (
    <span
      className={`font-display text-xs text-text-muted tracking-wider ${className ?? ""}`}
    >
      <span className="text-glow-amber-sm">
        {stats ? formatNumber(stats.daily) : "--"}
      </span>{" "}
      today{" / "}
      <span className="text-glow-amber-sm">
        {stats ? formatNumber(stats.total) : "--"}
      </span>{" "}
      total
    </span>
  );
};

export default VisitorStats;
