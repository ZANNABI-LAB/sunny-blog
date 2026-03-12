import { getPublishedPortfolios } from "@/lib/notion";
import type { PortfolioProject } from "@/types/portfolio";

export const revalidate = 3600; // ISR 1시간

const ProjectCard = ({ project }: { project: PortfolioProject }) => (
  <a
    href={project.notionUrl}
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
          {project.period.start?.slice(0, 4)}
          {project.period.end && ` ~ ${project.period.end.slice(0, 4)}`}
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

const PortfolioPage = async () => {
  let projects: PortfolioProject[] = [];

  try {
    projects = await getPublishedPortfolios();
  } catch {
    // Notion API 실패 시 빈 목록으로 fallback
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {/* More coming soon placeholder */}
        <div className="border border-dashed border-border rounded-lg p-6 flex items-center justify-center min-h-[200px]">
          <p className="font-display text-xs text-text-muted tracking-[0.2em] uppercase">
            More coming soon
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
