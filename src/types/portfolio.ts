export type PortfolioProject = {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  status: string;
  category: string;
  period: { start: string; end: string | null };
  role: string[];
  thumbnail: string | null;
  githubUrl: string | null;
  deployUrl: string | null;
  linearUrl: string | null;
  notionUrl: string;
};
