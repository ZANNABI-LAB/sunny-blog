export type GraphNode = {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  category: string;
  tags: string[];
  summary: string;
};

export type GraphEdge = {
  source: string;
  target: string;
  weight: number;
  sharedTags: string[];
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};
