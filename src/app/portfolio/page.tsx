const PortfolioPage = () => {
  return (
    <div className="max-w-5xl mx-auto animate-page-fade-in space-y-12">
      <header>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight text-glow-amber">
          PORTFOLIO
        </h1>
        <p className="mt-2 font-display text-xs text-zinc-500 tracking-[0.2em] uppercase">
          Projects &amp; Experiments
        </p>
      </header>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deep Thought card */}
        <div
          className="group relative border border-white/10 rounded-lg p-6 bg-white/[0.02] hover:border-amber-400/30 transition-colors brutal-accent overflow-hidden"
          style={{ "--card-category-color": "#f59e0b" } as React.CSSProperties}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-display text-lg text-white tracking-wider">
              Deep Thought
            </h3>
            <span className="font-display text-[10px] text-zinc-600 tracking-wider uppercase">
              2026
            </span>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
            AI Native 개인 기술 블로그 — Cosmic Brutalist 디자인, RAG 검색, 자동
            콘텐츠 생성
          </p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-[10px] font-display text-amber-400/60 border border-amber-400/20 rounded-full px-2 py-0.5">
              Next.js
            </span>
            <span className="text-[10px] font-display text-amber-400/60 border border-amber-400/20 rounded-full px-2 py-0.5">
              D3.js
            </span>
            <span className="text-[10px] font-display text-amber-400/60 border border-amber-400/20 rounded-full px-2 py-0.5">
              Claude API
            </span>
          </div>
        </div>

        {/* More projects placeholder */}
        <div className="border border-dashed border-white/10 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
          <p className="font-display text-xs text-zinc-600 tracking-[0.2em] uppercase">
            More coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
