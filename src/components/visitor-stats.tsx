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
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        setStats({ daily: data.daily ?? 0, total: data.total ?? 0 });
      } catch (err) {
        console.error("VisitorStats error:", err);
        setError(true);
      }
    };

    fetchStats();
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
