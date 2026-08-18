import { Orbit } from "next/font/google";

/**
 * Orbit — 디스플레이 폰트 (워드마크 / 페이지 타이틀 / 레이블 전용)
 * Regular(400) 단일 굵기. 본문에는 사용하지 않는다.
 *
 * 서브셋을 latin으로 한정한 이유:
 * - next/font의 폰트 메타데이터가 Orbit에 latin / latin-ext만 등록하고 있어
 *   "korean"은 타입 레벨에서 거부된다.
 * - 실용적으로도 한글까지 Orbit으로 렌더하면(각진 디스플레이 폰트) 포스트
 *   제목 가독성이 떨어진다. 한글은 아래 fallback(Pretendard)이 받는다.
 *   워드마크·탭 라벨은 전부 라틴이라 Orbit이 그대로 적용된다.
 */
export const orbit = Orbit({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-orbit",
  fallback: [
    "Pretendard Variable",
    "Pretendard",
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "sans-serif",
  ],
});
