"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getCategoryColor } from "@/lib/categories";

type PostPreviewProps = {
  node: { title: string; category: string; tags: string[]; summary: string; slug: string };
  position: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClose?: () => void;
};

const PostPreview = ({ node, position, containerRef, onClose }: PostPreviewProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(position);
  const [isMobile, setIsMobile] = useState(false);

  // Swipe-to-dismiss state
  const [translateY, setTranslateY] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartY = useRef<number | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotion.current = mq.matches;
    const motionHandler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener("change", motionHandler);

    return () => {
      window.removeEventListener("resize", checkMobile);
      mq.removeEventListener("change", motionHandler);
    };
  }, []);

  // Swipe-to-dismiss handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = cardRef.current;
    if (!el) return;
    // Only allow swipe when scrolled to top
    if (el.scrollTop > 0) return;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    // Only track downward swipe
    if (deltaY > 0) {
      setIsSwiping(true);
      setTranslateY(deltaY);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartY.current === null) return;
    touchStartY.current = null;

    if (translateY >= 80) {
      // Swipe threshold met — close
      onClose?.();
    } else {
      // Snap back
      setIsSwiping(false);
      setTranslateY(0);
    }
  }, [translateY, onClose]);

  useEffect(() => {
    if (isMobile) return;
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const offset = 40;
    let x = position.x + offset;
    let y = position.y;

    if (x + cardRect.width > containerRect.width)
      x = position.x - cardRect.width - offset;
    if (y - cardRect.height / 2 < 0) y = cardRect.height / 2;
    if (y + cardRect.height / 2 > containerRect.height)
      y = containerRect.height - cardRect.height / 2;

    setAdjustedPos({ x, y });
  }, [position, containerRef, isMobile]);

  // Mobile: fixed bottom sheet with swipe-to-dismiss
  if (isMobile) {
    const swipeOpacity = isSwiping ? Math.max(0.3, 1 - translateY / 300) : 1;
    const snapBackTransition = !isSwiping && translateY === 0 && !prefersReducedMotion.current
      ? "transform 200ms ease-out, opacity 200ms ease-out"
      : isSwiping
        ? "none"
        : undefined;

    return (
      <div
        ref={cardRef}
        className="fixed bottom-0 inset-x-0 z-[35] max-h-[60vh] overflow-y-auto overscroll-contain rounded-t-xl border-t border-border bg-bg-elevated/95 backdrop-blur-sm p-4 shadow-lg shadow-black/50 animate-sheet-up"
        style={{
          paddingBottom: "calc(1rem + var(--safe-bottom))",
          transform: isSwiping ? `translateY(${translateY}px)` : undefined,
          opacity: swipeOpacity,
          transition: snapBackTransition,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pb-3">
          <div className="w-10 h-1 rounded-full bg-text-muted/30" />
        </div>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-text-primary">{node.title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-text-secondary hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="미리보기 닫기"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <span
          className="mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            backgroundColor: `${getCategoryColor(node.category)}15`,
            color: getCategoryColor(node.category),
          }}
        >
          {node.category}
        </span>
        {node.summary && (
          <p className="mt-1.5 text-xs text-text-secondary line-clamp-3 leading-relaxed">
            {node.summary}
          </p>
        )}
        {node.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-card-hover px-1.5 py-0.5 text-[10px] text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <Link
          href={`/tech/${node.slug}`}
          className="mt-3 inline-block text-xs text-accent hover:text-accent-hover font-medium min-h-[44px] flex items-center"
        >
          상세 보기 &rarr;
        </Link>
      </div>
    );
  }

  // Desktop: absolute positioned card near node
  return (
    <div
      ref={cardRef}
      className="absolute z-[35] w-56 rounded-lg border border-border bg-bg-elevated/95 backdrop-blur-sm p-3 shadow-lg shadow-black/50"
      style={{
        left: `${adjustedPos.x}px`,
        top: `${adjustedPos.y}px`,
        transform: "translateY(-50%)",
      }}
    >
      <h3 className="text-sm font-semibold text-text-primary truncate">
        {node.title}
      </h3>
      <span
        className="mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium"
        style={{
          backgroundColor: `${getCategoryColor(node.category)}15`,
          color: getCategoryColor(node.category),
        }}
      >
        {node.category}
      </span>
      {node.summary && (
        <p className="mt-1.5 text-xs text-text-secondary line-clamp-2 leading-relaxed">
          {node.summary}
        </p>
      )}
      {node.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {node.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-card-hover px-1.5 py-0.5 text-[10px] text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <Link
        href={`/tech/${node.slug}`}
        className="mt-2 inline-block text-xs text-accent hover:text-accent-hover font-medium"
      >
        상세 보기 &rarr;
      </Link>
    </div>
  );
};

export default PostPreview;
