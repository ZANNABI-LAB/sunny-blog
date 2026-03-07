const ProfilePage = () => {
  return (
    <div className="max-w-4xl mx-auto animate-page-fade-in space-y-16">
      <header>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-text-primary tracking-tight text-glow-amber">
          PROFILE
        </h1>
        <p className="mt-2 font-display text-xs text-text-muted tracking-[0.2em] uppercase">
          Backend Developer &amp; AI Native Builder
        </p>
      </header>

      {/* About */}
      <section>
        <h2 className="font-display text-lg text-accent tracking-[0.15em] uppercase mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-accent mr-2 align-middle" />
          About
        </h2>
        <div className="border border-border rounded-lg p-6 bg-card">
          <p className="text-text-secondary text-sm">Coming soon</p>
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="font-display text-lg text-accent tracking-[0.15em] uppercase mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-accent mr-2 align-middle" />
          Skills
        </h2>
        <div className="border border-border rounded-lg p-6 bg-card">
          <p className="text-text-secondary text-sm">Coming soon</p>
        </div>
      </section>

      {/* Experience */}
      <section>
        <h2 className="font-display text-lg text-accent tracking-[0.15em] uppercase mb-4">
          <span className="inline-block w-2 h-2 rounded-full bg-accent mr-2 align-middle" />
          Experience
        </h2>
        <div className="border border-border rounded-lg p-6 bg-card">
          <p className="text-text-secondary text-sm">Coming soon</p>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;
