const Footer = () => {
  return (
    <footer className="relative z-30 footer-gradient-border bg-[#0a0a0f]/60 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between" style={{ paddingBottom: "calc(1.5rem + var(--safe-bottom))" }}>
        <span className="font-display text-xs text-zinc-500 tracking-wider">&copy; 2026 Deep Thought</span>
        <a
          href="https://github.com/ZANNABI-LAB"
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-xs text-zinc-500 tracking-[0.2em] uppercase transition-colors duration-150 hover:text-white rounded-sm zannabi-glow focus-visible:ring-2 focus-visible:ring-indigo-400/50 focus-visible:outline-none"
        >
          ZANNABI LAB
        </a>
      </div>
    </footer>
  );
};

export default Footer;
