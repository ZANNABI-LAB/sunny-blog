import type { PostMeta } from "@/types/post";
import type { GraphData, GraphNode, GraphEdge } from "@/types/graph";
import { getCategoryRoot, getCategorySub } from "@/lib/categories";

/** 서브카테고리 노드 생성 임계값 — 이 수 이상의 포스트가 있어야 서브카테고리 노드 생성 */
const SUB_MIN_POSTS = 1;

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

  // Collect unique root categories that have posts
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

  // Collect subcategories and count posts per subcategory
  const subCategoryPostCount = new Map<string, number>(); // "Backend.Spring" -> count
  for (const node of postNodes) {
    const sub = getCategorySub(node.category);
    if (sub) {
      const key = node.category; // e.g. "Backend.Spring"
      subCategoryPostCount.set(key, (subCategoryPostCount.get(key) ?? 0) + 1);
    }
  }

  // Create subcategory nodes for those meeting the threshold
  const validSubCategories = new Set<string>();
  const subCategoryNodes: GraphNode[] = [];
  for (const [fullCat, count] of subCategoryPostCount) {
    if (count >= SUB_MIN_POSTS) {
      validSubCategories.add(fullCat);
      const root = getCategoryRoot(fullCat);
      const sub = getCategorySub(fullCat)!;
      subCategoryNodes.push({
        id: `subcategory::${fullCat}`,
        slug: "",
        title: sub,
        category: root,
        tags: [],
        summary: "",
        type: "subcategory",
      });
    }
  }

  // Hub <-> Subcategory edges
  for (const fullCat of validSubCategories) {
    const root = getCategoryRoot(fullCat);
    edges.push({
      source: `subcategory::${fullCat}`,
      target: `category::${root}`,
      weight: 3,
      sharedTags: [],
    });
  }

  // Post -> Subcategory or Post -> Hub edges
  for (const node of postNodes) {
    const sub = getCategorySub(node.category);
    if (sub && validSubCategories.has(node.category)) {
      // Post connects to subcategory (not directly to hub)
      edges.push({
        source: node.id,
        target: `subcategory::${node.category}`,
        weight: 2,
        sharedTags: [],
      });
    } else {
      // Post connects directly to hub
      const root = getCategoryRoot(node.category);
      edges.push({
        source: node.id,
        target: `category::${root}`,
        weight: 2,
        sharedTags: [],
      });
    }
  }

  // Post <-> Post edges (같은 루트 카테고리 + 공유 태그)
  for (let i = 0; i < postNodes.length; i++) {
    for (let j = i + 1; j < postNodes.length; j++) {
      const a = postNodes[i];
      const b = postNodes[j];

      if (getCategoryRoot(a.category) !== getCategoryRoot(b.category)) continue;

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

  return { nodes: [...hubNodes, ...subCategoryNodes, ...postNodes], edges };
};
