const TitleOverlay = () => {
  return (
    <div className="absolute left-4 bottom-8 md:left-12 md:top-1/2 md:-translate-y-1/2 md:bottom-auto max-w-md pointer-events-none">
      {/* Brand wordmark */}
      <h1
        className="font-display text-xl md:text-7xl font-bold text-text-primary leading-none opacity-50 md:opacity-100"
        style={{ filter: `drop-shadow(0 0 30px var(--glow-accent))` }}
      >
        <span className="tracking-[0.15em]">DEEP</span>
        <br />
        <span className="tracking-[0.15em]">THOUGHT</span>
      </h1>

      {/* Tagline — hidden on mobile */}
      <p className="hidden md:block font-display text-xs text-text-muted mt-4 tracking-[0.3em] uppercase leading-relaxed">
        The answer to the ultimate question
        <br />
        of life, the universe, and code.
      </p>
    </div>
  );
};

export default TitleOverlay;
