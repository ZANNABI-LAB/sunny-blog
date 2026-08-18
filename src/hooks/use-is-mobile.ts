"use client";

import { useEffect, useState } from "react";

/** Tailwind `md` 브레이크포인트와 같은 경계 */
const MOBILE_QUERY = "(max-width: 767px)";

/**
 * 모바일 뷰포트 여부.
 *
 * resize 리스너 + window.innerWidth 비교를 컴포넌트마다 복붙하던 것을 대체한다.
 * matchMedia는 경계를 넘을 때만 발화하므로 리사이즈 중 불필요한 리렌더가 없고,
 * 임계값이 Tailwind `md:`와 한 곳에서 일치한다.
 *
 * SSR/첫 렌더에서는 false를 돌려준다 — 레이아웃 자체를 가르는 데 쓰지 말고
 * (그건 CSS `md:`가 할 일), 햅틱·스와이프처럼 JS로만 갈리는 동작에 쓴다.
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mq.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
};
