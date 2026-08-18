"use client";

import { useEffect, useRef } from "react";

/**
 * prefers-reduced-motion 현재 값을 ref로 돌려준다.
 *
 * 값이 바뀌어도 리렌더가 필요 없는(애니메이션 시작 직전에 읽기만 하는)
 * 용도라 state가 아니라 ref다. post-preview / chatbot-widget이 같은 코드를
 * 복붙하고 있던 것을 합쳤다.
 */
export const usePrefersReducedMotionRef = () => {
  const ref = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    ref.current = mq.matches;

    const handler = (e: MediaQueryListEvent) => {
      ref.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return ref;
};
