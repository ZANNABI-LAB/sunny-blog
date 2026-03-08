export type Category =
  | "Architecture"
  | "Design Pattern"
  | "Security"
  | "Testing"
  | "Infrastructure"
  | "Backend"
  | "Frontend";

export const CATEGORY_COLORS: Record<Category, string> = {
  Architecture: "#fbbf24",     // amber-400
  "Design Pattern": "#f5b120", // amber-420
  Testing: "#efa31c",          // amber-440
  Frontend: "#e99518",         // amber-460
  Security: "#e38714",         // amber-480
  Infrastructure: "#dd7910",   // amber-540
  Backend: "#d97706",          // amber-600
};

export const CATEGORY_COLORS_LIGHT: Record<Category, string> = {
  Architecture: "#b45309",     // amber-700
  "Design Pattern": "#a64b08",
  Testing: "#984308",
  Frontend: "#8a3b07",
  Security: "#893507",
  Infrastructure: "#832d06",
  Backend: "#78350f",          // amber-900
};

export const CATEGORIES: Category[] = Object.keys(
  CATEGORY_COLORS
) as Category[];

const DEFAULT_COLOR = "#e99518";
const DEFAULT_COLOR_LIGHT = "#8a3b07";

/**
 * 도트 표기법에서 root 카테고리를 추출한다.
 * 예: "Backend.Spring" -> "Backend"
 */
export const getCategoryRoot = (category: string): string =>
  category.split(".")[0];

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
