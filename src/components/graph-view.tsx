"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";
import type { GraphData, GraphNode } from "@/types/graph";
import { getCategoryColor, getCategoryRoot } from "@/lib/categories";
import PostPreview from "@/components/post-preview";

type GraphViewProps = {
  data: GraphData;
  highlightedCategory?: string | null;
  focusCategory?: string | null;
};

type SimNode = GraphNode &
  SimulationNodeDatum & {
    breathPhase: number;
    breathPeriod: number;
  };

type SimEdge = SimulationLinkDatum<SimNode> & {
  weight: number;
  sharedTags: string[];
};

// B4: Hub size constants (reduced from original)
const HUB_INNER_R = 20;
const HUB_OUTER_R = 22;
const HUB_LABEL_DY = 32;

// Desktop defaults
const HUB_COLLIDE_R_DESKTOP = 55;
const POST_COLLIDE_R_DESKTOP = 55;
const POST_R_DESKTOP = 14;
const CHARGE_HUB_DESKTOP = -800;
const CHARGE_POST_DESKTOP = -400;

// Mobile overrides (wider spacing, larger nodes)
const HUB_COLLIDE_R_MOBILE = 70;
const POST_COLLIDE_R_MOBILE = 65;
const POST_R_MOBILE = 16;
const CHARGE_HUB_MOBILE = -1000;
const CHARGE_POST_MOBILE = -600;

// D: Touch hit area radii (44px+ touch targets)
const POST_HIT_R = 22;
const HUB_HIT_R = 28;

// B: Long press duration
const LONG_PRESS_MS = 800;
const DRAG_THRESHOLD = 5;

// Haptic feedback utility (safe for iOS Safari)
const triggerHaptic = (duration: number) => {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(duration);
    }
  } catch {
    // Silently ignore — vibrate not supported (e.g., iOS Safari)
  }
};

const GraphView = ({
  data,
  highlightedCategory = null,
  focusCategory = null,
}: GraphViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const router = useRouter();
  const isDragging = useRef<boolean>(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const hoveredNodeRef = useRef<SimNode | null>(null);
  const [previewPos, setPreviewPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Sync hoveredNodeRef with state
  useEffect(() => {
    hoveredNodeRef.current = hoveredNode;
  }, [hoveredNode]);

  // Long press state
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressActiveRef = useRef<boolean>(false);
  const longPressNodeRef = useRef<SimNode | null>(null);

  // Store refs for category highlight updates without re-running simulation
  const nodeElementsRef = useRef<d3.Selection<
    SVGGElement,
    SimNode,
    SVGGElement,
    unknown
  > | null>(null);
  const linkElementsRef = useRef<d3.Selection<
    SVGLineElement,
    SimEdge,
    SVGGElement,
    unknown
  > | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);

  // B1: Zoom refs for legend focus
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const svgSelectionRef = useRef<d3.Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  > | null>(null);

  // A2/A3: Animation state refs
  const hasAnimatedRef = useRef(false);
  const breathTimerRef = useRef<d3.Timer | null>(null);

  // Reduced motion preference
  const prefersReducedMotionRef = useRef(false);

  // Dismiss preview on close
  const handlePreviewClose = useCallback(() => {
    setHoveredNode(null);
    setPreviewPos(null);
    // Reset highlight
    const nodeElements = nodeElementsRef.current;
    const linkElements = linkElementsRef.current;
    if (nodeElements && linkElements) {
      const dur = prefersReducedMotionRef.current ? 0 : 200;
      nodeElements.transition().duration(dur).attr("opacity", 1);
      linkElements
        .transition()
        .duration(dur)
        .attr("stroke", (_: SimEdge, i: number) => `url(#edge-gradient-${i})`)
        .attr("opacity", 0.25);
    }
  }, []);

  // Cancel long press helper
  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // Remove progress ring if present
    if (longPressNodeRef.current && svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.selectAll(".lp-track, .lp-ring").remove();
    }
    longPressActiveRef.current = false;
    longPressNodeRef.current = null;
  }, []);

  // Apply category highlight via ref (avoids re-creating simulation)
  useEffect(() => {
    const nodeElements = nodeElementsRef.current;
    const linkElements = linkElementsRef.current;
    if (!nodeElements || !linkElements) return;

    const dur = prefersReducedMotionRef.current ? 0 : 200;

    if (highlightedCategory) {
      nodeElements
        .transition()
        .duration(dur)
        .attr("opacity", (d) => {
          if (d.type === "category") {
            return d.title === highlightedCategory ? 1 : 0.1;
          }
          return getCategoryRoot(d.category) === highlightedCategory ? 1 : 0.1;
        });

      linkElements
        .transition()
        .duration(dur)
        .attr("opacity", (d) => {
          const src = d.source as SimNode;
          const tgt = d.target as SimNode;
          const srcMatch =
            src.type === "category"
              ? src.title === highlightedCategory
              : getCategoryRoot(src.category) === highlightedCategory;
          const tgtMatch =
            tgt.type === "category"
              ? tgt.title === highlightedCategory
              : getCategoryRoot(tgt.category) === highlightedCategory;
          return srcMatch && tgtMatch ? 1 : 0.1;
        });
    } else {
      nodeElements.transition().duration(dur).attr("opacity", 1);
      linkElements.transition().duration(dur).attr("opacity", 1);
    }
  }, [highlightedCategory]);

  // B1: Legend focus - zoom to category hub on focusCategory change
  useEffect(() => {
    const zoom = zoomRef.current;
    const svgSel = svgSelectionRef.current;
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!zoom || !svgSel || !svgEl || !container) return;

    const { width, height } = container.getBoundingClientRect();
    const simNodes = simNodesRef.current;

    const dur = prefersReducedMotionRef.current ? 0 : 600;

    if (focusCategory) {
      // Find the hub node for this category
      const hubNode = simNodes.find(
        (n) => n.type === "category" && n.title === focusCategory
      );
      if (hubNode && hubNode.x != null && hubNode.y != null) {
        const scale = 1.8;
        const tx = width / 2 - hubNode.x * scale;
        const ty = height / 2 - hubNode.y * scale;
        const transform = d3.zoomIdentity.translate(tx, ty).scale(scale);
        svgSel.transition().duration(dur).call(zoom.transform, transform);
      }
    } else {
      // Fit to view (same as B3 logic)
      fitToView(svgSel, zoom, simNodes, width, height, dur);
    }
  }, [focusCategory]);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    // Reset animation state on data change
    hasAnimatedRef.current = false;
    if (breathTimerRef.current) {
      breathTimerRef.current.stop();
      breathTimerRef.current = null;
    }

    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      if (e.matches && breathTimerRef.current) {
        breathTimerRef.current.stop();
        breathTimerRef.current = null;
      }
    };
    motionQuery.addEventListener("change", handleMotionChange);

    const { width, height } = container.getBoundingClientRect();

    // Mobile detection based on container width
    const isMobile = width < 768;
    const POST_R = isMobile ? POST_R_MOBILE : POST_R_DESKTOP;
    const HUB_COLLIDE_R = isMobile ? HUB_COLLIDE_R_MOBILE : HUB_COLLIDE_R_DESKTOP;
    const POST_COLLIDE_R = isMobile ? POST_COLLIDE_R_MOBILE : POST_COLLIDE_R_DESKTOP;
    const CHARGE_HUB = isMobile ? CHARGE_HUB_MOBILE : CHARGE_HUB_DESKTOP;
    const CHARGE_POST = isMobile ? CHARGE_POST_MOBILE : CHARGE_POST_DESKTOP;

    const simNodes: SimNode[] = data.nodes.map((n) => ({
      ...n,
      breathPhase: Math.random() * Math.PI * 2,
      breathPeriod: 2000 + Math.random() * 3000,
    }));
    simNodesRef.current = simNodes;
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

    svgSelectionRef.current = svg;

    svg.selectAll("*").remove();

    // ARIA: accessible interactive graph
    svg
      .attr("role", "group")
      .attr("aria-roledescription", "인터랙티브 그래프")
      .attr("aria-label", "기술 블로그 포스트 관계 그래프 — 카테고리별 허브 노드와 포스트 노드의 연결을 보여주는 별자리 형태의 인터랙티브 그래프");

    const defs = svg.append("defs");

    // Glow filter for post nodes
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

    // B4: Hub glow filter (stdDeviation 8 -> 6)
    const hubFilter = defs
      .append("filter")
      .attr("id", "hub-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    hubFilter
      .append("feGaussianBlur")
      .attr("stdDeviation", "6")
      .attr("result", "blur");
    const hubMerge = hubFilter.append("feMerge");
    hubMerge.append("feMergeNode").attr("in", "blur");
    hubMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // A4: Edge gradient definitions
    simEdges.forEach((_, i) => {
      const grad = defs
        .append("linearGradient")
        .attr("id", `edge-gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse");
      grad.append("stop").attr("offset", "0%").attr("class", "edge-stop-start");
      grad.append("stop").attr("offset", "100%").attr("class", "edge-stop-end");
    });

    const zoomContainer = svg.append("g").attr("class", "zoom-container");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        zoomContainer.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // B: SVG background click to dismiss preview
    svg.on("click", (event) => {
      // Only if clicking on the SVG background (not on a node)
      if (event.target === svgEl || (event.target as Element).classList.contains("zoom-container")) {
        setHoveredNode(null);
        setPreviewPos(null);
        resetHighlight();
      }
    });

    const edgeGroup = zoomContainer.append("g").attr("class", "edges");
    const nodeGroup = zoomContainer.append("g").attr("class", "nodes");

    // A4: Edge gradient stroke
    const linkElements = edgeGroup
      .selectAll<SVGLineElement, SimEdge>("line")
      .data(simEdges)
      .join("line")
      .attr("stroke", (_, i) => `url(#edge-gradient-${i})`)
      .attr("stroke-width", (d) => Math.max(1, Math.min(d.weight, 3)))
      .attr("opacity", 0); // A2: Start hidden

    linkElementsRef.current = linkElements;

    const nodeElements = nodeGroup
      .selectAll<SVGGElement, SimNode>("g")
      .data(simNodes)
      .join("g")
      .attr("cursor", "pointer")
      .style("outline", "none")
      .attr("tabindex", "0")
      .attr("role", "button")
      .attr("aria-label", (d) =>
        d.type === "category"
          ? `${d.title} 카테고리 — 클릭하여 필터링`
          : `${d.title} — 탭하여 미리보기, 길게 눌러 상세 보기`
      )
      .attr("opacity", 0); // A2: Start hidden

    nodeElementsRef.current = nodeElements;

    // Render nodes differently based on type
    nodeElements.each(function (d) {
      const g = d3.select(this);
      const color = getCategoryColor(d.category);

      // D: Transparent hit area for touch targets
      g.append("circle")
        .attr("class", "hit-area")
        .attr("r", d.type === "category" ? HUB_HIT_R : POST_HIT_R)
        .attr("fill", "transparent")
        .attr("pointer-events", "all");

      if (d.type === "category") {
        // B4: Hub node: outer ring (28 -> 22)
        g.append("circle")
          .attr("r", 0) // A2: Start at 0
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("opacity", 0.3)
          .attr("class", "hub-outer");

        // B4: Hub node: inner filled circle (26 -> 20)
        g.append("circle")
          .attr("r", 0) // A2: Start at 0
          .attr("fill", color)
          .attr("opacity", 0.85)
          .attr("filter", "url(#hub-glow)")
          .attr("class", "hub-inner");

        // B4: Hub label (dy 40 -> 32)
        g.append("text")
          .attr("dy", HUB_LABEL_DY)
          .attr("text-anchor", "middle")
          .attr("fill", "var(--text-secondary)")
          .attr("font-size", "13")
          .attr("font-weight", "600")
          .text(d.title);
      } else {
        // Post node
        g.append("circle")
          .attr("r", 0) // A2: Start at 0
          .attr("fill", color)
          .attr("filter", "url(#glow)")
          .attr("class", "post-circle");

        // Post label
        g.append("text")
          .attr("dy", 28)
          .attr("text-anchor", "middle")
          .attr("fill", "var(--text-muted)")
          .attr("font-size", "11")
          .text(d.shortTitle ?? d.title);
      }
    });

    const highlightConnected = (node: SimNode) => {
      const dur = prefersReducedMotionRef.current ? 0 : 200;
      const connectedIds = new Set<string>([node.id]);

      if (node.type === "category") {
        simNodes.forEach((n) => {
          if (
            n.type === "post" &&
            getCategoryRoot(n.category) === node.title
          ) {
            connectedIds.add(n.id);
          }
        });
      } else {
        simEdges.forEach((e) => {
          const src = (e.source as SimNode).id;
          const tgt = (e.target as SimNode).id;
          if (src === node.id) connectedIds.add(tgt);
          if (tgt === node.id) connectedIds.add(src);
        });
      }

      nodeElements
        .transition()
        .duration(dur)
        .attr("opacity", (d) => (connectedIds.has(d.id) ? 1 : 0.15));

      linkElements
        .transition()
        .duration(dur)
        .attr("stroke", (d, i) => {
          const src = (d.source as SimNode).id;
          const tgt = (d.target as SimNode).id;
          return connectedIds.has(src) && connectedIds.has(tgt)
            ? "var(--text-muted)"
            : `url(#edge-gradient-${i})`;
        })
        .attr("opacity", (d) => {
          const src = (d.source as SimNode).id;
          const tgt = (d.target as SimNode).id;
          return connectedIds.has(src) && connectedIds.has(tgt) ? 1 : 0.15;
        });
    };

    const resetHighlight = () => {
      const dur = prefersReducedMotionRef.current ? 0 : 200;
      nodeElements.transition().duration(dur).attr("opacity", 1);
      linkElements
        .transition()
        .duration(dur)
        .attr("stroke", (_, i) => `url(#edge-gradient-${i})`)
        .attr("opacity", 0.25);
    };

    // B: Long press flash and navigate
    const flashAndNavigate = (nodeEl: SVGGElement, d: SimNode) => {
      const g = d3.select(nodeEl);
      const reduced = prefersReducedMotionRef.current;

      // Haptic feedback on navigate
      triggerHaptic(30);

      // Remove progress ring
      g.selectAll(".lp-track, .lp-ring").remove();

      if (d.type === "category") {
        if (!reduced) {
          g.select(".hub-inner")
            .transition()
            .duration(150)
            .attr("r", HUB_INNER_R + 4)
            .transition()
            .duration(200)
            .attr("r", HUB_INNER_R);
        }
        setTimeout(
          () => router.push(`/tech?category=${encodeURIComponent(d.title)}`),
          reduced ? 0 : 300
        );
      } else {
        if (!reduced) {
          g.select(".post-circle")
            .transition()
            .duration(150)
            .attr("r", POST_R + 6)
            .transition()
            .duration(200)
            .attr("r", POST_R);
        }
        setTimeout(
          () => router.push(`/tech/${d.slug}`),
          reduced ? 0 : 300
        );
      }
    };

    // B: Start long press with progress animation
    const startLongPress = (nodeEl: SVGGElement, d: SimNode) => {
      cancelLongPress();
      longPressActiveRef.current = false;
      longPressNodeRef.current = d;

      const g = d3.select(nodeEl);
      const color = getCategoryColor(d.category);
      const progressR = d.type === "category" ? HUB_INNER_R + 4 : POST_R + 4;
      const circumference = 2 * Math.PI * progressR;
      const reduced = prefersReducedMotionRef.current;

      if (!reduced) {
        // Add background track
        g.append("circle")
          .attr("class", "lp-track")
          .attr("r", progressR)
          .attr("fill", "none")
          .attr("stroke", "var(--border-primary)")
          .attr("stroke-width", 1)
          .attr("transform", "rotate(-90)");

        // Add progress ring
        g.append("circle")
          .attr("class", "lp-ring")
          .attr("r", progressR)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 3)
          .attr("stroke-linecap", "round")
          .attr("stroke-dasharray", circumference)
          .attr("stroke-dashoffset", circumference)
          .attr("transform", "rotate(-90)")
          .transition()
          .duration(LONG_PRESS_MS)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
      } else {
        // Reduced motion: dim the node to indicate long press
        g.transition().duration(0).attr("opacity", 0.5);
      }

      longPressTimerRef.current = setTimeout(() => {
        longPressActiveRef.current = true;
        longPressNodeRef.current = null;
        longPressTimerRef.current = null;

        if (reduced) {
          g.transition().duration(0).attr("opacity", 1);
        }

        // Haptic feedback on long press completion
        triggerHaptic(50);

        flashAndNavigate(nodeEl, d);
      }, LONG_PRESS_MS);
    };

    // B: Event handlers — remove mouseenter/mouseleave, use tap-based interaction
    nodeElements
      .on("keydown", (event: KeyboardEvent, d) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (d.type === "category") {
            router.push(`/tech?category=${encodeURIComponent(d.title)}`);
          } else {
            router.push(`/tech/${d.slug}`);
          }
        }
      })
      .on("focus", function (_event, d) {
        const g = d3.select(this);
        const color = getCategoryColor(d.category);
        const r = d.type === "category" ? HUB_INNER_R + 4 : POST_R + 4;
        g.append("circle")
          .attr("class", "focus-ring")
          .attr("r", r)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4 2")
          .attr("opacity", 0.8);
        highlightConnected(d);
      })
      .on("blur", function () {
        d3.select(this).select(".focus-ring").remove();
        resetHighlight();
      });

    // Custom force: hub-post distance vs post-post distance
    const linkForce = d3
      .forceLink<SimNode, SimEdge>(simEdges)
      .id((d) => d.id)
      .distance((d) => {
        const src = d.source as SimNode;
        const tgt = d.target as SimNode;
        const hasHub = src.type === "category" || tgt.type === "category";
        return hasHub ? 120 : 200;
      });

    const simulation = d3
      .forceSimulation<SimNode>(simNodes)
      .force("link", linkForce)
      .force(
        "charge",
        d3.forceManyBody<SimNode>().strength((d) =>
          d.type === "category" ? CHARGE_HUB : CHARGE_POST
        )
      )
      .force("center", d3.forceCenter(width * 0.55, height / 2))
      .force(
        "collide",
        d3.forceCollide<SimNode>().radius((d) =>
          d.type === "category" ? HUB_COLLIDE_R : POST_COLLIDE_R
        )
      )
      .on("tick", () => {
        // A4: Update edge gradient positions
        simEdges.forEach((d, i) => {
          const src = d.source as SimNode;
          const tgt = d.target as SimNode;
          const srcColor = getCategoryColor(src.category);
          const tgtColor = getCategoryColor(tgt.category);

          defs
            .select(`#edge-gradient-${i}`)
            .attr("x1", src.x ?? 0)
            .attr("y1", src.y ?? 0)
            .attr("x2", tgt.x ?? 0)
            .attr("y2", tgt.y ?? 0);

          defs
            .select(`#edge-gradient-${i} .edge-stop-start`)
            .attr("stop-color", srcColor);
          defs
            .select(`#edge-gradient-${i} .edge-stop-end`)
            .attr("stop-color", tgtColor);
        });

        linkElements
          .attr("x1", (d) => (d.source as SimNode).x ?? 0)
          .attr("y1", (d) => (d.source as SimNode).y ?? 0)
          .attr("x2", (d) => (d.target as SimNode).x ?? 0)
          .attr("y2", (d) => (d.target as SimNode).y ?? 0);

        nodeElements.attr(
          "transform",
          (d) => `translate(${d.x ?? 0},${d.y ?? 0})`
        );

        // B2: Drift prevention - stop when stabilized
        if (simulation.alpha() < 0.01) {
          simulation.stop();
        }

        // A2: Entry animation trigger when simulation settles
        if (!hasAnimatedRef.current && simulation.alpha() < 0.05) {
          hasAnimatedRef.current = true;
          runEntryAnimation(
            svg,
            zoom,
            simNodes,
            nodeElements,
            linkElements,
            width,
            height
          );
        }
      });

    // A2: Entry animation function
    const runEntryAnimation = (
      svgSel: d3.Selection<SVGSVGElement, unknown, null, undefined>,
      zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>,
      nodes: SimNode[],
      nodeEls: d3.Selection<SVGGElement, SimNode, SVGGElement, unknown>,
      linkEls: d3.Selection<SVGLineElement, SimEdge, SVGGElement, unknown>,
      w: number,
      h: number
    ) => {
      const reduced = prefersReducedMotionRef.current;
      const dur = reduced ? 0 : 400;
      const fitDur = reduced ? 0 : 800;

      // B3: fitToView first
      fitToView(svgSel, zoomBehavior, nodes, w, h, fitDur);

      // Hubs animate first
      const hubNodes = nodeEls.filter((d) => d.type === "category");
      const postNodes = nodeEls.filter((d) => d.type === "post");

      hubNodes
        .transition()
        .duration(dur)
        .attr("opacity", 1);
      hubNodes
        .selectAll<SVGCircleElement, unknown>(".hub-inner")
        .transition()
        .duration(dur)
        .attr("r", HUB_INNER_R);
      hubNodes
        .selectAll<SVGCircleElement, unknown>(".hub-outer")
        .transition()
        .duration(dur)
        .attr("r", HUB_OUTER_R);

      // Posts animate with stagger (no stagger if reduced motion)
      postNodes
        .transition()
        .delay((_, i) => (reduced ? 0 : 200 + i * 50))
        .duration(dur)
        .attr("opacity", 1);
      postNodes
        .selectAll<SVGCircleElement, unknown>(".post-circle")
        .transition()
        .delay((_, i) => (reduced ? 0 : 200 + i * 50))
        .duration(dur)
        .attr("r", POST_R);

      // Links fade in
      linkEls
        .transition()
        .delay(reduced ? 0 : 200)
        .duration(reduced ? 0 : 600)
        .attr("opacity", 0.25);

      // A3: Start breathing after entry animation completes (skip if reduced motion)
      if (!reduced) {
        const totalDelay = 200 + postNodes.size() * 50 + 400;
        setTimeout(() => {
          startBreathing(nodes, nodeEls);
        }, totalDelay);
      }
    };

    // A3: Breathing effect
    const startBreathing = (
      nodes: SimNode[],
      nodeEls: d3.Selection<SVGGElement, SimNode, SVGGElement, unknown>
    ) => {
      const hubCircles = nodeEls
        .filter((d) => d.type === "category")
        .selectAll<SVGCircleElement, unknown>(".hub-inner");
      const postCircles = nodeEls
        .filter((d) => d.type === "post")
        .selectAll<SVGCircleElement, unknown>(".post-circle");
      const hubOuters = nodeEls
        .filter((d) => d.type === "category")
        .selectAll<SVGCircleElement, unknown>(".hub-outer");

      breathTimerRef.current = d3.timer((elapsed) => {
        hubCircles.each(function (_, i) {
          const nodeData = nodes.filter((n) => n.type === "category")[i];
          if (!nodeData) return;
          const r =
            HUB_INNER_R +
            Math.sin(elapsed / nodeData.breathPeriod + nodeData.breathPhase) *
              0.8;
          d3.select(this).attr("r", r);
        });

        hubOuters.each(function (_, i) {
          const nodeData = nodes.filter((n) => n.type === "category")[i];
          if (!nodeData) return;
          const r =
            HUB_OUTER_R +
            Math.sin(elapsed / nodeData.breathPeriod + nodeData.breathPhase) *
              0.8;
          d3.select(this).attr("r", r);
        });

        postCircles.each(function (_, i) {
          const nodeData = nodes.filter((n) => n.type === "post")[i];
          if (!nodeData) return;
          const r =
            POST_R +
            Math.sin(elapsed / nodeData.breathPeriod + nodeData.breathPhase) *
              0.5;
          d3.select(this).attr("r", r);
        });
      });
    };

    // B4: Drag handler with long press integration
    const drag = d3
      .drag<SVGGElement, SimNode>()
      .on("start", function (event, d) {
        const sourceEvent = event.sourceEvent;
        dragStartPos.current = {
          x: sourceEvent.clientX ?? sourceEvent.touches?.[0]?.clientX ?? 0,
          y: sourceEvent.clientY ?? sourceEvent.touches?.[0]?.clientY ?? 0,
        };
        isDragging.current = false;

        // B2: Restart simulation for dragging
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;

        // B: Start long press timer
        startLongPress(this, d);
      })
      .on("drag", (event, d) => {
        if (dragStartPos.current) {
          const sourceEvent = event.sourceEvent;
          const clientX = sourceEvent.clientX ?? sourceEvent.touches?.[0]?.clientX ?? 0;
          const clientY = sourceEvent.clientY ?? sourceEvent.touches?.[0]?.clientY ?? 0;
          const dx = clientX - dragStartPos.current.x;
          const dy = clientY - dragStartPos.current.y;
          if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
            isDragging.current = true;
            // B: Cancel long press on drag
            cancelLongPress();
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
      .on("end", function (event, d) {
        // B: Cancel long press if still pending
        const wasLongPressActive = longPressActiveRef.current;
        cancelLongPress();

        if (!isDragging.current && !wasLongPressActive) {
          // B: Tap/click — toggle PostPreview (not navigate)
          try {
            if (d.type === "category") {
              // Category tap — keep existing behavior: navigate to tech page
              const el = d3.select(this);
              const reduced = prefersReducedMotionRef.current;
              if (!reduced) {
                el.select(".hub-inner")
                  .transition()
                  .duration(150)
                  .attr("r", HUB_INNER_R + 4)
                  .transition()
                  .duration(200)
                  .attr("r", HUB_INNER_R);
              }
              setTimeout(
                () => router.push(`/tech?category=${encodeURIComponent(d.title)}`),
                reduced ? 0 : 300
              );
            } else {
              // Post node tap — show/toggle PostPreview
              if (hoveredNodeRef.current?.id === d.id) {
                // Already showing this node's preview — dismiss
                setHoveredNode(null);
                setPreviewPos(null);
                resetHighlight();
              } else {
                const transform = d3.zoomTransform(svgEl);
                setHoveredNode(d);
                setPreviewPos({
                  x: transform.applyX(d.x!),
                  y: transform.applyY(d.y!),
                });
                highlightConnected(d);
              }
            }
          } catch (err) {
            console.warn("Node tap handler error:", err);
          }
        }

        isDragging.current = false;
        dragStartPos.current = null;
        // B2: Stop simulation gracefully after drag
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeElements.call(drag);

    const resizeObserver = new ResizeObserver((entries) => {
      const { width: w, height: h } = entries[0].contentRect;
      svg.attr("width", w).attr("height", h);
      simulation.force("center", d3.forceCenter(w * 0.55, h / 2));
      simulation.alpha(0.3).restart();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      simulation.stop();
      motionQuery.removeEventListener("change", handleMotionChange);
      cancelLongPress();
      if (breathTimerRef.current) {
        breathTimerRef.current.stop();
        breathTimerRef.current = null;
      }
    };
  }, [data, router, cancelLongPress]);

  return (
    <div ref={containerRef} className="absolute inset-0 touch-none">
      <svg ref={svgRef} />
      {hoveredNode && hoveredNode.type === "post" && previewPos && (
        <PostPreview
          node={hoveredNode}
          position={previewPos}
          containerRef={containerRef}
          onClose={handlePreviewClose}
        />
      )}
    </div>
  );
};

// B3: Fit all nodes into view
const fitToView = (
  svgSel: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown>,
  nodes: SimNode[],
  width: number,
  height: number,
  duration: number
) => {
  if (nodes.length === 0) return;

  const mobile = width < 768;
  const paddingLeft = mobile ? 30 : 100; // mobile: compact, desktop: avoid TitleOverlay
  const padding = 50;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const n of nodes) {
    if (n.x == null || n.y == null) continue;
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x);
    maxY = Math.max(maxY, n.y);
  }

  const bw = maxX - minX + paddingLeft + padding;
  const bh = maxY - minY + padding * 2;
  const fitScale = Math.min(Math.min(width / bw, height / bh) * 0.85, 2.0);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  // Shift transform slightly right to account for left title area
  const tx = width / 2 - cx * fitScale + (paddingLeft - padding) * 0.3;
  const ty = height / 2 - cy * fitScale;
  const transform = d3.zoomIdentity.translate(tx, ty).scale(fitScale);

  svgSel.transition().duration(duration).call(zoomBehavior.transform, transform);
};

export default GraphView;
