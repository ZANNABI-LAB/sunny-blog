"use client";

import { useEffect, useState } from "react";
import GraphView from "@/components/graph-view";
import TitleOverlay from "@/components/title-overlay";
import SearchBar from "@/components/search-bar";
import CategoryLegend from "@/components/category-legend";
import type { GraphData } from "@/types/graph";
import { getCategoryRoot } from "@/lib/categories";

type MainHeroProps = {
  graphData: GraphData;
};

const MainHero = ({ graphData }: MainHeroProps) => {
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(
    null
  );

  // Extract unique categories from graph data (from hub nodes)
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
            "radial-gradient(ellipse at center, #0f1729 0%, #0a0a0f 70%)",
        }}
      />

      {/* Graph layer */}
      <div className="absolute inset-0 z-10">
        <GraphView data={graphData} highlightedCategory={highlightedCategory} />
      </div>

      {/* Overlay layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center">
        <TitleOverlay />
        <SearchBar />
        <CategoryLegend
          categories={categories}
          activeCategory={highlightedCategory}
          onToggle={setHighlightedCategory}
        />
      </div>
    </div>
  );
};

export default MainHero;
