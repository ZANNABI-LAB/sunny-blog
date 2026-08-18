type PanelProps = {
  /** 패널 머리에 찍히는 라벨 — 전부 대문자 라틴 (픽셀 폰트가 가장 잘 나온다) */
  label: string;
  /** 라벨 오른쪽 보조 표기 (일련번호, 상태값 등) */
  meta?: string;
  /** 상태 LED 점등 여부 */
  live?: boolean;
  children: React.ReactNode;
  className?: string;
};

/**
 * 정거장 계기판 한 칸.
 *
 * 배경 이미지 위에 얹히므로 반투명 바탕 + backdrop blur로 글자를 읽히게 한다.
 * 둥근 모서리는 쓰지 않는다 — 하드 엣지가 도트 컨셉의 뼈대다.
 */
const Panel = ({ label, meta, live = false, children, className = "" }: PanelProps) => (
  <section
    className={`border-2 border-border bg-bg-primary/78 backdrop-blur-[2px] ${className}`}
  >
    <header className="flex items-center justify-between gap-2 border-b-2 border-border px-3 py-2">
      <span className="font-display text-caption text-accent">{label}</span>
      <span className="flex items-center gap-2">
        {meta && (
          <span className="font-display text-caption text-text-muted">{meta}</span>
        )}
        {live && (
          <i
            aria-hidden="true"
            className="block h-2 w-2 bg-accent motion-safe:animate-led-blink"
          />
        )}
      </span>
    </header>
    <div className="px-3 py-3">{children}</div>
  </section>
);

export default Panel;
