"use client";

import { useEffect, useState, type ReactNode } from "react";

type ViewCountProviderProps = {
  slugs: string[];
  children: (viewCounts: Record<string, number>) => ReactNode;
};

const ViewCountProvider = ({ slugs, children }: ViewCountProviderProps) => {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (slugs.length === 0) return;

    const fetchViewCounts = async () => {
      try {
        const res = await fetch(
          `/api/views?slugs=${encodeURIComponent(slugs.join(","))}`
        );
        const data = await res.json();
        setViewCounts(data.views ?? {});
      } catch (err) {
        console.error("ViewCountProvider error:", err);
        setViewCounts({});
      }
    };

    fetchViewCounts();
  }, [slugs]);

  return <>{children(viewCounts)}</>;
};

export default ViewCountProvider;
