"use client";

type ViewBadgeProps = {
  viewCount?: number;
  className?: string;
};

const ViewBadge = ({ viewCount, className }: ViewBadgeProps) => {
  if (viewCount === undefined) return null;

  return (
    <span
      className={`font-display text-xs text-text-muted tracking-wider ${className ?? ""}`}
      aria-label={`조회수 ${viewCount}회`}
    >
      {viewCount} views
    </span>
  );
};

export default ViewBadge;
