export type PostMeta = {
  slug: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  tags: string[];
  category: string;
  summary: string;
  author: string;
  references: string[];
  source?: string;
  sourceUrl?: string;
};

export type Post = PostMeta & {
  contentHtml: string;
};
