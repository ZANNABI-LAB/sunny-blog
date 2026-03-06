"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";
import type { GraphData, GraphNode } from "@/types/graph";

type GraphViewProps = {
  data: GraphData;
};

type SimNode = GraphNode & SimulationNodeDatum;
type SimEdge = SimulationLinkDatum<SimNode> & {
  weight: number;
  sharedTags: string[];
};

const CATEGORY_COLORS: Record<string, string> = {
  backend: "#f59e0b",
  frontend: "#06b6d4",
};
const DEFAULT_NODE_COLOR = "#818cf8";

const getNodeColor = (category: string): string =>
  CATEGORY_COLORS[category.toLowerCase()] ?? DEFAULT_NODE_COLOR;

const GraphView = ({ data }: GraphViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    const { width, height } = container.getBoundingClientRect();

    const simNodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const simEdges: SimEdge[] = data.edges.map((e) => ({
      source: e.source,
      target: e.target,
      weight: e.weight,
      sharedTags: e.sharedTags,
    }));

    const svg = d3
      .select(svgEl)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const defs = svg.append("defs");
    const filter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "4")
      .attr("result", "blur");
    const merge = filter.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const zoomContainer = svg.append("g").attr("class", "zoom-container");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        zoomContainer.attr("transform", event.transform);
      });

    svg.call(zoom);

    const edgeGroup = zoomContainer.append("g").attr("class", "edges");
    const nodeGroup = zoomContainer.append("g").attr("class", "nodes");

    const linkElements = edgeGroup
      .selectAll<SVGLineElement, SimEdge>("line")
      .data(simEdges)
      .join("line")
      .attr("stroke", "rgba(255,255,255,0.15)")
      .attr("stroke-width", (d) => Math.max(1, Math.min(d.weight, 3)));

    const nodeElements = nodeGroup
      .selectAll<SVGGElement, SimNode>("g")
      .data(simNodes)
      .join("g")
      .attr("cursor", "grab");

    nodeElements
      .append("circle")
      .attr("r", 14)
      .attr("fill", (d) => getNodeColor(d.category))
      .attr("filter", "url(#glow)");

    nodeElements
      .append("text")
      .attr("dy", 28)
      .attr("text-anchor", "middle")
      .attr("fill", "#a1a1aa")
      .attr("font-size", "11")
      .text((d) => d.shortTitle ?? d.title);

    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimEdge>(simEdges)
          .id((d) => d.id)
          .distance(180)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(55))
      .on("tick", () => {
        linkElements
          .attr("x1", (d) => (d.source as SimNode).x ?? 0)
          .attr("y1", (d) => (d.source as SimNode).y ?? 0)
          .attr("x2", (d) => (d.target as SimNode).x ?? 0)
          .attr("y2", (d) => (d.target as SimNode).y ?? 0);

        nodeElements.attr(
          "transform",
          (d) => `translate(${d.x ?? 0},${d.y ?? 0})`
        );
      });

    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeElements.call(drag);

    const resizeObserver = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect;
      svg.attr("width", w).attr("height", h);
      simulation.force("center", d3.forceCenter(w / 2, h / 2));
      simulation.alpha(0.3).restart();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      simulation.stop();
    };
  }, [data]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <svg ref={svgRef} />
    </div>
  );
};

export default GraphView;
