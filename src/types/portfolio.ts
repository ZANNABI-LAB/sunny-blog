export type PortfolioProject = {
  slug: string;
  name: string;
  description: string;
  techStack: string[];
  period: { start: string; end: string | null };
  thumbnail: string | null;
  githubUrl: string | null;
  deployUrl: string | null;
  published: boolean;
  content: string;
};
