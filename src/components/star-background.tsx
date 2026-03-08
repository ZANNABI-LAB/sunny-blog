"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  phase: number;
  period: number;
};

const StarBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;

    const getStarColor = (): [number, number, number] => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--star-color")
        .trim();
      const match = raw.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (match) return [+match[1], +match[2], +match[3]];
      return [255, 255, 255];
    };

    const getStarCountFactor = (): number => {
      const val = getComputedStyle(document.documentElement)
        .getPropertyValue("--star-count-factor")
        .trim();
      return parseFloat(val) || 1;
    };

    let starRgb = getStarColor();
    let starCountFactor = getStarCountFactor();

    const initStars = () => {
      const w = canvas.width;
      const h = canvas.height;
      const baseCount = Math.min(200, Math.max(100, Math.floor((w * h) / 10000)));
      const count = Math.floor(baseCount * starCountFactor);
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: 1 + Math.random() * 2,
          baseOpacity: 0.2 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          period: 2000 + Math.random() * 3000,
        });
      }
      starsRef.current = stars;
    };

    const renderStatic = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (const star of starsRef.current) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starRgb[0]}, ${starRgb[1]}, ${starRgb[2]}, ${star.baseOpacity})`;
        ctx.fill();
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initStars();

      if (reducedMotionRef.current) {
        renderStatic();
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(canvas);

    const render = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      for (const star of starsRef.current) {
        const opacity =
          star.baseOpacity *
          (0.5 + 0.5 * Math.sin((time / star.period) * Math.PI * 2 + star.phase));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${starRgb[0]}, ${starRgb[1]}, ${starRgb[2]}, ${opacity})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    // Only start animation loop if motion is not reduced
    if (!reducedMotionRef.current) {
      animationRef.current = requestAnimationFrame(render);
    }

    // Listen for runtime changes to reduced-motion preference
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
      if (e.matches) {
        cancelAnimationFrame(animationRef.current);
        renderStatic();
      } else {
        animationRef.current = requestAnimationFrame(render);
      }
    };
    motionQuery.addEventListener("change", handleMotionChange);

    // Watch for theme changes via MutationObserver on <html> class
    const observer = new MutationObserver(() => {
      starRgb = getStarColor();
      const newFactor = getStarCountFactor();
      if (newFactor !== starCountFactor) {
        starCountFactor = newFactor;
        resize(); // reinit stars with new count
      }
      if (reducedMotionRef.current) {
        renderStatic();
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionChange);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
};

export default StarBackground;
