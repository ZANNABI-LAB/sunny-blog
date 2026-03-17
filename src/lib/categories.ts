export type Category =
  | "Architecture"
  | "Design Pattern"
  | "Security"
  | "Testing"
  | "Infrastructure"
  | "Backend"
  | "Frontend";

export const CATEGORY_COLORS: Record<Category, string> = {
  Backend: "#9bb0ff",          // O형 청백색
  Frontend: "#aabfff",         // B형 청색
  Testing: "#cad8ff",          // A형 백색 (연한 청백)
  Architecture: "#fff4ea",     // F형 황백색
  "Design Pattern": "#ffd700", // G형 황색
  Infrastructure: "#ffb347",   // K형 주황색
  Security: "#ff6b6b",         // M형 적색
};

export const CATEGORY_COLORS_LIGHT: Record<Category, string> = {
  Backend: "#4a6cf7",          // O형 진한 청
  Frontend: "#5a7df7",         // B형 청색
  Testing: "#6b6bbd",          // A형 보라청
  Architecture: "#c89a45",     // F형 황갈
  "Design Pattern": "#b8960a", // G형 진한 황
  Infrastructure: "#d4801a",   // K형 진한 주황
  Security: "#c0392b",         // M형 진한 적
};

export const CATEGORIES: Category[] = Object.keys(
  CATEGORY_COLORS
) as Category[];

const DEFAULT_COLOR = "#ffd700";      // G형 황색 (가장 보편적인 별)
const DEFAULT_COLOR_LIGHT = "#b8960a";

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
