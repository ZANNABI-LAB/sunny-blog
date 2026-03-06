export type SearchResult = {
  slug: string;
  title: string;
  summary: string;
  score: number;
};

export type SearchResponse = {
  results: SearchResult[];
};

export type SearchErrorResponse = {
  error: string;
};
