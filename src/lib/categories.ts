export type Category =
  | "Architecture"
  | "Design Pattern"
  | "Security"
  | "Testing"
  | "Infrastructure"
  | "Backend"
  | "Frontend";

/**
 * 카테고리 색 — 인광체 그린 한 색상의 명도 단계.
 *
 * 악센트를 초록 하나로 통일했기 때문에 카테고리를 색상(hue)으로는 가를 수 없다.
 * 대신 CRT 인광체가 세기별로 다르게 빛나듯 밝기로 구분한다. 인접한 카테고리끼리
 * 헷갈리지 않도록 밝기 순서대로 늘어놓지 않고 밝음/어두움을 교차 배치했다.
 */
export const CATEGORY_COLORS: Record<Category, string> = {
  Backend: "#3dff88",          // 기준 인광체
  Frontend: "#8cffbf",         // 밝게
  Testing: "#26c468",          // 어둡게
  Architecture: "#b9ffd8",     // 가장 밝게
  "Design Pattern": "#159b4c", // 더 어둡게
  Infrastructure: "#63efa0",   // 중간 밝기
  Security: "#0c7a3a",         // 가장 어둡게
};

/**
 * 라이트 테마용. 흰 바탕에서는 밝은 인광체가 전혀 보이지 않으므로
 * 같은 색상의 어두운 구간(대비 4.5:1 이상)으로 전부 내렸다.
 */
export const CATEGORY_COLORS_LIGHT: Record<Category, string> = {
  Backend: "#067a3c",
  Frontend: "#0a9c4e",
  Testing: "#04562c",
  Architecture: "#0fb85e",
  "Design Pattern": "#033f20",
  Infrastructure: "#088a45",
  Security: "#022b16",
};

export const CATEGORIES: Category[] = Object.keys(
  CATEGORY_COLORS
) as Category[];

// 미분류 — 기준 인광체 색
const DEFAULT_COLOR = "#3dff88";
const DEFAULT_COLOR_LIGHT = "#067a3c";

/**
 * 도트 표기법에서 root 카테고리를 추출한다.
 * 예: "Backend.Spring" -> "Backend"
 */
export const getCategoryRoot = (category: string): string =>
  category.split(".")[0];

/**
 * 도트 표기법에서 서브카테고리를 추출한다.
 * 예: "Backend.Spring" -> "Spring"
 * 서브카테고리가 없으면 null 반환.
 */
export const getCategorySub = (category: string): string | null => {
  const parts = category.split(".");
  return parts.length > 1 ? parts[1] : null;
};

/**
 * 포스트 목록에서 특정 root 카테고리의 서브카테고리(full dotted path)를 추출한다.
 * 예: getSubCategories(posts, "Backend") -> ["Backend.Java", "Backend.Spring"]
 */
export const getSubCategories = (
  posts: { category: string }[],
  rootCategory: string
): string[] => {
  const subs = new Set<string>();
  for (const post of posts) {
    if (getCategoryRoot(post.category) === rootCategory) {
      const sub = getCategorySub(post.category);
      if (sub) subs.add(post.category);
    }
  }
  return Array.from(subs).sort();
};

/**
 * 카테고리 색상을 반환한다. 도트 표기법 지원.
 * 매칭 실패 시 기본 색상 반환.
 * theme 인자로 light/dark 팔레트를 선택할 수 있다.
 */
export const getCategoryColor = (category: string, theme?: "light" | "dark"): string => {
  const root = getCategoryRoot(category);
  if (theme === "light") {
    return (CATEGORY_COLORS_LIGHT as Record<string, string>)[root] ?? DEFAULT_COLOR_LIGHT;
  }
  return (CATEGORY_COLORS as Record<string, string>)[root] ?? DEFAULT_COLOR;
};
