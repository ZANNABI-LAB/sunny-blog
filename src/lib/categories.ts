export type Category =
  | "Architecture"
  | "Design Pattern"
  | "Security"
  | "Testing"
  | "Infrastructure"
  | "Backend"
  | "Frontend";

export const CATEGORY_COLORS: Record<Category, string> = {
  Architecture: "#f59e0b",
  "Design Pattern": "#f472b6",
  Security: "#ef4444",
  Testing: "#fbbf24",
  Infrastructure: "#10b981",
  Backend: "#06b6d4",
  Frontend: "#a78bfa",
};

export const CATEGORIES: Category[] = Object.keys(
  CATEGORY_COLORS
) as Category[];

const DEFAULT_COLOR = "#818cf8";

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
