export type Category =
  | "Architecture"
  | "Design Pattern"
  | "Security"
  | "Testing"
  | "Infrastructure"
  | "Backend"
  | "Frontend";

export const CATEGORY_COLORS: Record<Category, string> = {
  Architecture: "#fbbf24",
  "Design Pattern": "#f59e0b",
  Security: "#fcd34d",
  Testing: "#b45309",
  Infrastructure: "#92400e",
  Backend: "#d97706",
  Frontend: "#eab308",
};

export const CATEGORIES: Category[] = Object.keys(
  CATEGORY_COLORS
) as Category[];

const DEFAULT_COLOR = "#d4a017";

/**
 * 도트 표기법에서 root 카테고리를 추출한다.
 * 예: "Backend.Spring" -> "Backend"
 */
export const getCategoryRoot = (category: string): string =>
  category.split(".")[0];

/**
 * 카테고리 색상을 반환한다. 도트 표기법 지원.
 * 매칭 실패 시 기본 색상(#818cf8) 반환.
 */
export const getCategoryColor = (category: string): string => {
  const root = getCategoryRoot(category);
  return (CATEGORY_COLORS as Record<string, string>)[root] ?? DEFAULT_COLOR;
};
