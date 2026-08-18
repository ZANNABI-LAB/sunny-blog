/**
 * 매일메일 서비스 종료 후 콘텐츠가 이관된 GitHub 아카이브 파서.
 * https://github.com/maeil-mail/maeil-mail-contents
 *
 * 아카이브 구조:
 *   backend/toc.md            - [제목](contents/be-N.md) 목록
 *   backend/toc-category.md   - ## 카테고리 아래 [제목](contents/be-N.md) 목록
 *   backend/contents/be-N.md  - 답변 마크다운 원문
 *   frontend/...              - 동일 구조 (fe-N)
 */

export type ArchiveTrack = "backend" | "frontend";

export interface ArchiveEntry {
  key: string; // "be-1", "fe-23"
  track: ArchiveTrack;
  title: string; // 질문 제목 (toc.md 기준)
  category: string; // 아카이브 세부 카테고리 (toc-category.md 기준, 없으면 "")
}

export interface ArchiveQuestion extends ArchiveEntry {
  answer: string; // 답변 마크다운 원문
  references: string[];
  sourceUrl: string; // GitHub blob URL
}

const RAW_BASE =
  "https://raw.githubusercontent.com/maeil-mail/maeil-mail-contents/main";
const BLOB_BASE =
  "https://github.com/maeil-mail/maeil-mail-contents/blob/main";

const fetchText = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`아카이브 요청 실패 (HTTP ${response.status}): ${url}`);
  }
  return response.text();
};

/** toc 계열 파일에서 [제목](contents/be-N.md) 링크를 추출한다. */
const parseTocLinks = (
  markdown: string
): { key: string; title: string }[] => {
  const links: { key: string; title: string }[] = [];
  const pattern = /\[([^\]]+)\]\(contents\/((?:be|fe)-\d+)\.md\)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(markdown)) !== null) {
    links.push({ title: match[1].trim(), key: match[2] });
  }
  return links;
};

/** toc-category.md에서 key → 세부 카테고리 매핑을 추출한다. */
const parseCategoryMap = (markdown: string): Map<string, string> => {
  const map = new Map<string, string>();
  let currentCategory = "";
  for (const line of markdown.split("\n")) {
    const heading = line.match(/^##\s+(.+)/);
    if (heading) {
      currentCategory = heading[1].trim();
      continue;
    }
    const link = line.match(/\[[^\]]+\]\(contents\/((?:be|fe)-\d+)\.md\)/);
    if (link && currentCategory) {
      map.set(link[1], currentCategory);
    }
  }
  return map;
};

/** 한 트랙(backend/frontend)의 전체 목차를 가져온다. */
const fetchTrackEntries = async (
  track: ArchiveTrack
): Promise<ArchiveEntry[]> => {
  const [toc, tocCategory] = await Promise.all([
    fetchText(`${RAW_BASE}/${track}/toc.md`),
    fetchText(`${RAW_BASE}/${track}/toc-category.md`),
  ]);

  const categoryMap = parseCategoryMap(tocCategory);

  return parseTocLinks(toc).map(({ key, title }) => ({
    key,
    track,
    title,
    category: categoryMap.get(key) ?? "",
  }));
};

/** 아카이브 전체(BE + FE) 목차를 가져온다. */
export const fetchArchiveEntries = async (): Promise<ArchiveEntry[]> => {
  const [backend, frontend] = await Promise.all([
    fetchTrackEntries("backend"),
    fetchTrackEntries("frontend"),
  ]);
  return [...backend, ...frontend];
};

/** 마크다운 본문에서 참고자료 URL을 추출한다. */
const extractReferences = (content: string): string[] => {
  const urlPattern = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const urls: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = urlPattern.exec(content)) !== null) {
    urls.push(match[2]);
  }
  return [...new Set(urls)];
};

/** 아카이브 콘텐츠 파일 하나를 가져와 파싱한다. 실패 시 null. */
export const fetchArchiveQuestion = async (
  entry: ArchiveEntry
): Promise<ArchiveQuestion | null> => {
  const contentPath = `${entry.track}/contents/${entry.key}.md`;
  try {
    const answer = await fetchText(`${RAW_BASE}/${contentPath}`);
    if (answer.trim().length < 50) {
      console.warn(`[아카이브] ${entry.key}: 본문이 비정상적으로 짧습니다.`);
      return null;
    }
    return {
      ...entry,
      answer: answer.trim(),
      references: extractReferences(answer),
      sourceUrl: `${BLOB_BASE}/${contentPath}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[아카이브] ${entry.key}: 파싱 실패 - ${message}`);
    return null;
  }
};
