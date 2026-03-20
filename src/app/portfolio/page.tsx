import type { Metadata } from "next";
import { getPublishedPortfolios } from "@/lib/portfolio";
import type { PortfolioProject } from "@/types/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "프로젝트 포트폴리오 — 개인 프로젝트와 오픈소스 기여",
  alternates: { canonical: "/portfolio" },
};

const ProjectCard = ({ project }: { project: PortfolioProject }) => {
  const href = project.deployUrl ?? project.githubUrl ?? "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative border border-border rounded-lg overflow-hidden bg-card hover:border-accent/30 transition-colors brutal-accent block"
      style={{ "--card-category-color": "#f59e0b" } as React.CSSProperties}
    >
      {project.thumbnail && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-lg text-text-primary tracking-wider">
            {project.name}
          </h3>
          <span className="font-display text-[10px] text-text-muted tracking-wider uppercase shrink-0 ml-2">
            {project.period.start?.slice(0, 7)}
            {project.period.end && ` ~ ${project.period.end.slice(0, 7)}`}
          </span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed mb-4">
          {project.description}
        </p>
        <div className="flex gap-2 flex-wrap">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-display text-accent/60 border border-accent/20 rounded-full px-2 py-0.5"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
};

const PortfolioPage = () => {
  const projects = getPublishedPortfolios();

  return (
    <div className="max-w-5xl mx-auto animate-page-fade-in space-y-12">
      <header>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-text-primary tracking-tight text-glow-amber">
          PORTFOLIO
        </h1>
        <p className="mt-2 font-display text-xs text-text-muted tracking-[0.2em] uppercase">
          Projects &amp; Experiments
        </p>
      </header>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border rounded-lg p-16 flex flex-col items-center justify-center min-h-[300px] gap-4">
          <div className="font-display text-4xl text-text-muted/30">
            &gt;_
          </div>
          <p className="font-display text-sm text-text-muted tracking-[0.2em] uppercase">
            Coming Soon
          </p>
          <p className="text-xs text-text-muted/60 max-w-sm text-center">
            프로젝트를 준비 중입니다. 곧 업데이트됩니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
