import Panel from "@/components/station/panel";

type SystemStatusProps = {
  total: number;
  /** [카테고리, 글 수] — 많은 순 */
  breakdown: [string, number][];
  className?: string;
};

/**
 * 분야별 적재량을 게이지로 보여준다.
 *
 * 그래프가 같은 정보를 점으로 흩뿌려 해석을 방문자에게 미루는 반면,
 * 막대는 "어느 분야를 얼마나 썼는지"를 즉시 읽힌다.
 */
const SystemStatus = ({ total, breakdown, className }: SystemStatusProps) => {
  const max = breakdown[0]?.[1] ?? 1;

  return (
    <Panel label="SYSTEM STATUS" live className={className}>
      <p className="flex items-baseline gap-2">
        <b className="font-display text-h1 text-accent">{total}</b>
        <span className="font-display text-caption text-text-muted">
          ARCHIVED POSTS
        </span>
      </p>

      <ul className="mt-3 flex flex-col gap-1.5">
        {breakdown.map(([name, count]) => (
          <li key={name} className="grid grid-cols-[5.5rem_1fr_1.75rem] items-center gap-2">
            <span className="font-display text-caption text-text-muted truncate">
              {name.toUpperCase()}
            </span>
            {/* 막대는 악센트 단색이다 — 카테고리를 색으로 가르는 건 그래프의 몫이고,
                여기서는 이름이 바로 옆에 있어 색으로 구분할 이유가 없다 */}
            <span className="block h-2 bg-border-subtle" aria-hidden="true">
              <i
                className="block h-full bg-accent"
                style={{ width: `${Math.round((count / max) * 100)}%` }}
              />
            </span>
            <span className="font-display text-caption text-text-primary text-right tabular-nums">
              {count}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

export default SystemStatus;
