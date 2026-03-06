"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";
import type { GraphData, GraphNode } from "@/types/graph";
import PostPreview from "@/components/post-preview";

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
  const router = useRouter();
  const isDragging = useRef<boolean>(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(
    null
  );

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
      .attr("cursor", "pointer");

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

    const highlightConnected = (node: SimNode) => {
      const connectedIds = new Set<string>([node.id]);
      simEdges.forEach((e) => {
        const src = (e.source as SimNode).id;
        const tgt = (e.target as SimNode).id;
        if (src === node.id) connectedIds.add(tgt);
        if (tgt === node.id) connectedIds.add(src);
      });

      nodeElements
        .transition()
        .duration(200)
        .attr("opacity", (d) => (connectedIds.has(d.id) ? 1 : 0.15));

      linkElements
        .transition()
        .duration(200)
        .attr("stroke", (d) => {
          const src = (d.source as SimNode).id;
          const tgt = (d.target as SimNode).id;
          return src === node.id || tgt === node.id
            ? "rgba(255,255,255,0.5)"
            : "rgba(255,255,255,0.05)";
        })
        .attr("opacity", (d) => {
          const src = (d.source as SimNode).id;
          const tgt = (d.target as SimNode).id;
          return src === node.id || tgt === node.id ? 1 : 0.15;
        });
    };

    const resetHighlight = () => {
      nodeElements.transition().duration(200).attr("opacity", 1);
      linkElements
        .transition()
        .duration(200)
        .attr("stroke", "rgba(255,255,255,0.15)")
        .attr("opacity", 1);
    };

    nodeElements
      .on("mouseenter", (event, d) => {
        if (isDragging.current) return;
        const transform = d3.zoomTransform(svgEl);
        setHoveredNode(d);
        setPreviewPos({
          x: transform.applyX(d.x!),
          y: transform.applyY(d.y!),
        });
        highlightConnected(d);
      })
      .on("mouseleave", () => {
        setHoveredNode(null);
        setPreviewPos(null);
        resetHighlight();
      });

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
        dragStartPos.current = {
          x: event.sourceEvent.clientX,
          y: event.sourceEvent.clientY,
        };
        isDragging.current = false;
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        if (dragStartPos.current) {
          const dx = event.sourceEvent.clientX - dragStartPos.current.x;
          const dy = event.sourceEvent.clientY - dragStartPos.current.y;
          if (Math.sqrt(dx * dx + dy * dy) > 5) {
            isDragging.current = true;
          }
        }
        if (isDragging.current) {
          setHoveredNode(null);
          setPreviewPos(null);
          resetHighlight();
        }
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!isDragging.current) {
          d3.select(event.sourceEvent.currentTarget as Element)
            .select("circle")
            .transition()
            .duration(150)
            .attr("r", 20)
            .transition()
            .duration(200)
            .attr("r", 14);
          setTimeout(() => router.push(`/tech/${d.slug}`), 300);
        }
        isDragging.current = false;
        dragStartPos.current = null;
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
  }, [data, router]);

  return (
    <div ref={containerRef} className="absolute inset-0">
      <svg ref={svgRef} />
      {hoveredNode && previewPos && (
        <PostPreview
          node={hoveredNode}
          position={previewPos}
          containerRef={containerRef}
        />
      )}
    </div>
  );
};

export default GraphView;
