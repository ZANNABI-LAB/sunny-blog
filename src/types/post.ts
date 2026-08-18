/**
 * 시리즈 정보. 이론 글(자동 생성)과 실전/개발기 글(직접 작성)을 하나의
 * 시리즈로 묶는다. frontmatter 예시:
 *   series:
 *     id: "spring-transaction"
 *     title: "스프링 트랜잭션 깊게 파기"
 *     order: 1
 */
export type PostSeries = {
  id: string;
  title: string;
  order: number;
};

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  tags: string[];
  category: string;
  summary: string;
  author: string;
  references: string[];
  shortTitle?: string;
  source?: string;
  sourceUrl?: string;
  series?: PostSeries;
};

export type Post = PostMeta & {
  contentHtml: string;
};
