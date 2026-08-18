import { Orbit } from "next/font/google";

/**
 * Orbit — 디스플레이 폰트 (워드마크 / 페이지 타이틀 / 레이블 전용)
 * Regular(400) 단일 굵기. 본문에는 사용하지 않는다.
 *
 * subsets에 "korean"을 넣지 못하는 이유: next/font의 폰트 메타데이터가 Orbit에
 * latin / latin-ext만 등록하고 있어 타입 레벨에서 거부된다.
 *
 * 단, subsets는 "무엇을 preload할지"만 고르는 값이다. next/font는 Google이 주는
 * @font-face 91개(한글 unicode-range 포함)를 전부 셀프호스팅하므로 한글도 Orbit으로
 * 렌더되고, 한글 청크는 해당 글자가 실제로 쓰일 때만 내려온다. 즉 preload는 라틴만,
 * 한글은 지연 로드 — 우주 컨셉 유지와 초기 요청 수 억제를 동시에 만족한다.
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
