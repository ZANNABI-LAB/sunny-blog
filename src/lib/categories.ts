export type Category =
  | "Architecture"
  | "Design Pattern"
  | "Security"
  | "Testing"
  | "Infrastructure"
  | "Backend"
  | "Frontend";

export const CATEGORY_COLORS: Record<Category, string> = {
  Architecture: "#4fc3f7",
  "Design Pattern": "#1e88e5",
  Security: "#ffd54f",
  Testing: "#29b6f6",
  Infrastructure: "#ffb74d",
  Backend: "#1565c0",
  Frontend: "#ffca28",
};

export const CATEGORY_COLORS_LIGHT: Record<Category, string> = {
  Architecture: "#0369a1",
  "Design Pattern": "#1d4ed8",
  Security: "#854d0e",
  Testing: "#0284c7",
  Infrastructure: "#9a3412",
  Backend: "#1e40af",
  Frontend: "#854d0e",
};

export const CATEGORIES: Category[] = Object.keys(
  CATEGORY_COLORS
) as Category[];

const DEFAULT_COLOR = "#d4a017";
const DEFAULT_COLOR_LIGHT = "#92400e";

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
