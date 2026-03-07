const TitleOverlay = () => {
  return (
    <div className="hidden md:block absolute left-6 md:left-12 top-1/2 -translate-y-1/2 max-w-md pointer-events-none">
      {/* Brand wordmark */}
      <h1
        className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-text-primary leading-none"
        style={{ filter: `drop-shadow(0 0 30px var(--glow-accent))` }}
      >
        <span className="tracking-[0.15em]">DEEP</span>
        <br />
        <span className="tracking-[0.15em]">THOUGHT</span>
      </h1>

      {/* Tagline */}
      <p className="font-display text-[10px] md:text-xs text-text-muted mt-4 tracking-[0.3em] uppercase leading-relaxed">
        The answer to the ultimate question
        <br />
        of life, the universe, and code.
      </p>
    </div>
  );
};

export default TitleOverlay;
