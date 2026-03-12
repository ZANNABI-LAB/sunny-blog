"use client";

import { useEffect, useState } from "react";

type ViewCounterProps = {
  slug: string;
  className?: string;
};

const ViewCounter = ({ slug, className }: ViewCounterProps) => {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const trackView = async () => {
      try {
        let alreadyViewed = false;
        try {
          alreadyViewed = sessionStorage.getItem(`viewed:${slug}`) === "true";
        } catch {
          // sessionStorage 접근 실패 시 항상 POST
        }

        if (alreadyViewed) {
          // 이미 본 글: GET만 호출
          const res = await fetch(`/api/views?slug=${encodeURIComponent(slug)}`);
          const data = await res.json();
          setViewCount(data.viewCount ?? 0);
        } else {
          // 새 방문: POST 호출 (조회수 증가)
          const res = await fetch("/api/views", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });
          const data = await res.json();
          setViewCount(data.viewCount ?? 0);

          try {
            sessionStorage.setItem(`viewed:${slug}`, "true");
          } catch {
            // sessionStorage 저장 실패 무시
          }
        }
      } catch (err) {
        console.error("ViewCounter error:", err);
        setError(true);
      }
    };

    trackView();
  }, [slug]);

  if (error) return null;

  return (
    <span
      className={`font-display text-xs text-text-muted tracking-wider ${className ?? ""}`}
      aria-label={viewCount !== null ? `조회수 ${viewCount}회` : undefined}
    >
      {viewCount !== null ? viewCount : "--"} views
    </span>
  );
};

export default ViewCounter;
