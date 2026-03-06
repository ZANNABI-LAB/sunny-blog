const TitleOverlay = () => {
  return (
    <div className="flex flex-col items-center pt-12 md:pt-16">
      <h1
        className="text-3xl md:text-5xl font-bold text-white/90"
        style={{ filter: "drop-shadow(0 0 24px rgba(99,102,241,0.4))" }}
      >
        Sunny Blog
      </h1>
      <p className="text-sm md:text-base text-zinc-400 mt-2">
        Exploring the universe of code
      </p>
    </div>
  );
};

export default TitleOverlay;
