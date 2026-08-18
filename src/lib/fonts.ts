import localFont from "next/font/local";

/**
 * 전기칩 한글 (x10y12pxDenkiChipHangul) — 디스플레이 / UI 폰트
 * Lee Minseo, SIL OFL 1.1 (public/fonts/DenkiChipHangul-OFL.txt)
 *
 * 12px 비트맵 기반 픽셀 폰트다. **12의 배수 크기에서만 픽셀이 정확히 떨어진다** —
 * clamp()나 vw 같은 유동 크기를 주면 글자가 뭉개지므로, 타이포 스케일은
 * globals.css에서 12·24·36·48px 계단으로 고정해 두었다.
 *
 * 본문에는 쓰지 않는다. 긴 한글 기술 문서는 Pretendard가 받는다.
 */
export const denkiChip = localFont({
  src: "../../public/fonts/DenkiChipHangul.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-pixel",
  fallback: [
    "Pretendard Variable",
    "Pretendard",
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "sans-serif",
  ],
});
