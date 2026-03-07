export type LogMeta = {
  slug: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  tags: string[];
  summary: string;
};

export type Log = LogMeta & {
  contentHtml: string;
};
