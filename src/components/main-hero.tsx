"use client";

import { useEffect, useState } from "react";
import GraphView from "@/components/graph-view";
import TitleOverlay from "@/components/title-overlay";
import SearchBar from "@/components/search-bar";
import CategoryLegend from "@/components/category-legend";
import StarBackground from "@/components/star-background";
import type { GraphData } from "@/types/graph";
import { getCategoryRoot } from "@/lib/categories";

type MainHeroProps = {
  graphData: GraphData;
};

const MainHero = ({ graphData }: MainHeroProps) => {
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(
    null
  );

  const categories = graphData.nodes
    .filter((n) => n.type === "category")
    .map((n) => getCategoryRoot(n.category));

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="relative h-[calc(100dvh-48px)] overflow-hidden">
      {/* Background layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, #0f1729 0%, #0a0a0f 70%)",
        }}
      />

      {/* Star particle layer */}
      <div className="absolute inset-0 z-[5]">
        <StarBackground />
      </div>

      {/* Graph layer — shifted right for asymmetric layout */}
      <div className="absolute inset-0 z-10 md:left-[20%]">
        <GraphView
          data={graphData}
          highlightedCategory={highlightedCategory}
          focusCategory={highlightedCategory}
        />
      </div>

      {/* Left: Title + Search (asymmetric) */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <TitleOverlay />

        {/* Search — bottom left */}
        <div className="absolute bottom-32 left-6 md:left-12 pointer-events-auto">
          <SearchBar />
        </div>
      </div>

      {/* Right: Category Legend */}
      <CategoryLegend
        categories={categories}
        activeCategory={highlightedCategory}
        onToggle={setHighlightedCategory}
      />
    </div>
  );
};

export default MainHero;
