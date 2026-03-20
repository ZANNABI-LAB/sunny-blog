import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { PortfolioProject } from "@/types/portfolio";

const PORTFOLIOS_DIR = path.join(process.cwd(), "content", "portfolios");

export const getPublishedPortfolios = (): PortfolioProject[] => {
  if (!fs.existsSync(PORTFOLIOS_DIR)) return [];

  const files = fs.readdirSync(PORTFOLIOS_DIR).filter((f) => f.endsWith(".md"));

  const projects = files
    .map((filename): PortfolioProject | null => {
      const filePath = path.join(PORTFOLIOS_DIR, filename);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);

      if (!data.published) return null;

      return {
        slug: filename.replace(/\.md$/, ""),
        name: data.name ?? "",
        description: data.description ?? "",
        techStack: data.techStack ?? [],
        period: {
          start: data.period?.start ?? "",
          end: data.period?.end ?? null,
        },
        thumbnail: data.thumbnail ?? null,
        githubUrl: data.githubUrl ?? null,
        deployUrl: data.deployUrl ?? null,
        published: true,
        content,
      };
    })
    .filter((p): p is PortfolioProject => p !== null);

  // 최신 프로젝트 순 정렬
  projects.sort((a, b) => (b.period.start > a.period.start ? 1 : -1));

  return projects;
};
