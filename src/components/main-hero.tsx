"use client";

import GraphView from "@/components/graph-view";
import TitleOverlay from "@/components/title-overlay";
import SearchPlaceholder from "@/components/search-placeholder";
import type { GraphData } from "@/types/graph";

type MainHeroProps = {
  graphData: GraphData;
};

const MainHero = ({ graphData }: MainHeroProps) => {
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
        <GraphView data={graphData} />
      </div>

      {/* Overlay layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center">
        <TitleOverlay />
        <SearchPlaceholder />
      </div>
    </div>
  );
};

export default MainHero;
