import type { PostMeta } from "@/types/post";
import type { GraphData, GraphNode, GraphEdge } from "@/types/graph";
import { getCategoryRoot } from "@/lib/categories";

const toGraphNode = (post: PostMeta): GraphNode => ({
  id: post.slug,
  slug: post.slug,
  title: post.title,
  ...(post.shortTitle ? { shortTitle: post.shortTitle } : {}),
  category: post.category,
  tags: post.tags,
  summary: post.summary,
  type: "post",
});

const findSharedTags = (a: string[], b: string[]): string[] => {
  const setB = new Set(b);
  return a.filter((tag) => setB.has(tag));
};

export const buildGraphData = (posts: PostMeta[]): GraphData => {
  const postNodes = posts.map(toGraphNode);
  const edges: GraphEdge[] = [];

  // Collect unique categories that have posts
  const categorySet = new Set<string>();
  for (const node of postNodes) {
    categorySet.add(getCategoryRoot(node.category));
  }

  // Create hub nodes for each category
  const hubNodes: GraphNode[] = Array.from(categorySet).map((cat) => ({
    id: `category::${cat}`,
    slug: "",
    title: cat,
    category: cat,
    tags: [],
    summary: "",
    type: "category",
  }));

  // Post -> Hub edges
  for (const node of postNodes) {
    const root = getCategoryRoot(node.category);
    edges.push({
      source: node.id,
      target: `category::${root}`,
      weight: 2,
      sharedTags: [],
    });
  }

  // Post <-> Post edges (shared tags only, no sameCategory condition)
  for (let i = 0; i < postNodes.length; i++) {
    for (let j = i + 1; j < postNodes.length; j++) {
      const a = postNodes[i];
      const b = postNodes[j];
      const sharedTags = findSharedTags(a.tags, b.tags);

      if (sharedTags.length > 0) {
        edges.push({
          source: a.id,
          target: b.id,
          weight: sharedTags.length,
          sharedTags,
        });
      }
    }
  }

  return { nodes: [...hubNodes, ...postNodes], edges };
};
