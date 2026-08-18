type PageHeaderProps = {
  /** 페이지 타이틀 — 라틴 대문자 워드마크 톤을 유지한다 (Orbit) */
  title: string;
  /** 타이틀 아래 한 줄 설명 */
  subtitle?: React.ReactNode;
  className?: string;
};

const PageHeader = ({ title, subtitle, className = "" }: PageHeaderProps) => (
  <header className={className}>
    <h1 className="font-display text-display font-bold text-text-primary text-glow-accent">
      {title}
    </h1>
    {subtitle && (
      <p className="mt-2 font-display text-caption text-text-muted tracking-[0.2em] uppercase">
        {subtitle}
      </p>
    )}
  </header>
);

export default PageHeader;
