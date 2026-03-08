const Footer = () => {
  return (
    <footer className="relative z-30 footer-gradient-border bg-[var(--bg-footer)] backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between" style={{ paddingBottom: "calc(1.5rem + var(--safe-bottom))" }}>
        <span className="font-display text-xs text-text-muted tracking-wider">&copy; 2026 Deep Thought</span>
        <a
          href="https://github.com/ZANNABI-LAB"
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-xs text-text-muted tracking-[0.2em] uppercase transition-colors duration-150 hover:text-text-primary zannabi-glow focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:outline-none"
        >
          ZANNABI LAB
        </a>
      </div>
    </footer>
  );
};

export default Footer;
