const TitleOverlay = () => {
  return (
    <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 max-w-md pointer-events-none">
      {/* Brand wordmark */}
      <h1
        className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-none"
        style={{ filter: "drop-shadow(0 0 30px rgba(245,158,11,0.3))" }}
      >
        <span className="tracking-[0.15em]">DEEP</span>
        <br />
        <span className="tracking-[0.15em]">THOUGHT</span>
      </h1>

      {/* Tagline */}
      <p className="font-display text-[10px] md:text-xs text-zinc-500 mt-4 tracking-[0.3em] uppercase leading-relaxed">
        The answer to the ultimate question
        <br />
        of life, the universe, and code.
      </p>
    </div>
  );
};

export default TitleOverlay;
