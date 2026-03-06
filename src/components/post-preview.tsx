"use client";

import { useRef, useEffect, useState } from "react";

type PostPreviewProps = {
  node: { title: string; category: string; tags: string[]; summary: string };
  position: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
};

const PostPreview = ({ node, position, containerRef }: PostPreviewProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState(position);

  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    let x = position.x + 20;
    let y = position.y;

    if (x + cardRect.width > containerRect.width)
      x = position.x - cardRect.width - 20;
    if (y - cardRect.height / 2 < 0) y = cardRect.height / 2;
    if (y + cardRect.height / 2 > containerRect.height)
      y = containerRect.height - cardRect.height / 2;

    setAdjustedPos({ x, y });
  }, [position, containerRef]);

  return (
    <div
      ref={cardRef}
      className="absolute z-30 w-56 rounded-lg border border-white/10 bg-zinc-900/95 backdrop-blur-sm p-3 pointer-events-none shadow-lg shadow-black/50"
      style={{
        left: `${adjustedPos.x}px`,
        top: `${adjustedPos.y}px`,
        transform: "translateY(-50%)",
      }}
    >
      <h3 className="text-sm font-semibold text-white truncate">
        {node.title}
      </h3>
      <span className="mt-1 inline-block rounded-md bg-indigo-400/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-400">
        {node.category}
      </span>
      {node.summary && (
        <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
          {node.summary}
        </p>
      )}
      {node.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {node.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostPreview;
