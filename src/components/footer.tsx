const Footer = () => {
  return (
    <footer className="relative z-30 border-t border-white/10 bg-[#0a0a0f]/60 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <span className="text-sm text-zinc-500">&copy; 2026 Sunny&apos;s Blog</span>
        <a
          href="https://github.com/ZANNABI-LAB"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-400 transition-colors duration-150 hover:text-white"
        >
          ZANNABI LAB
        </a>
      </div>
    </footer>
  );
};

export default Footer;
