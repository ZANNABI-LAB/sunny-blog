import type { PostMeta } from "@/types/post";
import type { GraphData, GraphNode, GraphEdge } from "@/types/graph";

const toGraphNode = (post: PostMeta): GraphNode => ({
  id: post.slug,
  slug: post.slug,
  title: post.title,
  ...(post.shortTitle ? { shortTitle: post.shortTitle } : {}),
  category: post.category,
  tags: post.tags,
});

const findSharedTags = (a: string[], b: string[]): string[] => {
  const setB = new Set(b);
  return a.filter((tag) => setB.has(tag));
};

export const buildGraphData = (posts: PostMeta[]): GraphData => {
  const nodes = posts.map(toGraphNode);
  const edges: GraphEdge[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const sharedTags = findSharedTags(a.tags, b.tags);
      const sameCategory = a.category === b.category;

      if (sharedTags.length > 0 || sameCategory) {
        edges.push({
          source: a.id,
          target: b.id,
          weight: sharedTags.length,
          sharedTags,
        });
      }
    }
  }

  return { nodes, edges };
};
