import * as cheerio from "cheerio";

export interface MaeilMailQuestion {
  id: number;
  question: string;
  category: string;
  answer: string;
  references: string[];
  sourceUrl: string;
}

const BASE_URL = "https://www.maeil-mail.kr/question";

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * RSC 페이로드에서 답변 마크다운 원문을 추출한다.
 * self.__next_f.push 스크립트 태그에서 "T{length}," 형식의 텍스트 청크를 찾는다.
 */
const extractContentFromRscPayload = (html: string): string | null => {
  const $ = cheerio.load(html);
  const scripts = $("script")
    .map((_, el) => $(el).html() ?? "")
    .get();

  // RSC payload에서 텍스트 청크를 찾는다 (가장 긴 것이 답변 본문)
  let longestContent = "";

  for (const script of scripts) {
    if (!script.includes("self.__next_f.push")) continue;

    // "숫자:T숫자," 패턴 뒤에 오는 긴 텍스트 청크를 찾는다
    const match = script.match(/\d+:T(\d+),([\s\S]+)$/);
    if (!match) continue;

    const expectedLength = parseInt(match[1], 10);
    let content = match[2];

    // 끝에 있을 수 있는 "])가 있으면 제거
    if (content.endsWith('"])')) {
      content = content.slice(0, -3);
    } else if (content.endsWith('"]')) {
      content = content.slice(0, -2);
    }

    // 가장 긴 텍스트 청크를 답변 본문으로 판단
    if (content.length > longestContent.length && expectedLength > 100) {
      longestContent = content;
    }
  }

  if (!longestContent) return null;

  // JSON 이스케이프된 문자열을 정리한다
  let cleaned = longestContent
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .replace(/\\'/g, "'");

  return cleaned.trim() || null;
};

/**
 * cheerio로 렌더링된 HTML에서 답변 본문을 추출한다 (1차 전략).
 * CSS 클래스는 동적 해시이므로 구조 기반 셀렉터를 사용한다.
 */
const extractContentFromHtml = (html: string): string | null => {
  const $ = cheerio.load(html);

  // 구조 기반: 카테고리 텍스트 뒤에 나오는 본문 영역을 찾는다
  // data-sentry-component 속성 활용 시도
  const detailAnswer = $("[data-sentry-component='DetailAnswer']");
  if (detailAnswer.length > 0) {
    const text = detailAnswer.text().trim();
    if (text.length > 50) return text;
  }

  // 대안: 메인 콘텐츠 영역에서 가장 긴 텍스트 블록을 찾는다
  const mainContent = $("main, article, [role='main']");
  if (mainContent.length > 0) {
    const text = mainContent.text().trim();
    if (text.length > 50) return text;
  }

  return null;
};

/**
 * 질문 제목을 추출한다.
 */
const extractQuestion = (html: string): string => {
  const $ = cheerio.load(html);

  // h2 태그에서 질문 텍스트 추출 (첫 번째 h2가 질문)
  const h2 = $("h2").first();
  if (h2.length > 0) {
    return h2.text().trim();
  }

  return "";
};

/**
 * 카테고리를 추출한다.
 * "백엔드와 관련된 질문이에요" 패턴에서 카테고리명을 추출.
 */
const extractCategory = (html: string): string => {
  const $ = cheerio.load(html);

  // "와 관련된 질문이에요" 패턴을 포함하는 텍스트를 찾는다
  const bodyText = $("body").text();
  const categoryMatch = bodyText.match(/(\S+?)와 관련된 질문이에요/);
  if (categoryMatch) {
    return categoryMatch[1];
  }

  // 대안: span 태그에서 카테고리 텍스트 찾기
  const spans = $("span");
  for (let i = 0; i < spans.length; i++) {
    const text = $(spans[i]).text().trim();
    if (
      ["백엔드", "프론트엔드", "인프라", "CS", "커리어"].includes(text)
    ) {
      return text;
    }
  }

  return "기타";
};

/**
 * 마크다운 텍스트에서 참고자료 URL을 추출한다.
 * 표준 마크다운 링크 [text](url) 패턴을 찾는다.
 */
const extractReferences = (content: string): string[] => {
  const urlPattern = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const urls: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = urlPattern.exec(content)) !== null) {
    urls.push(match[2]);
  }

  return [...new Set(urls)];
};

/**
 * 단일 매일메일 질문을 파싱한다.
 */
export const parseMaeilMailQuestion = async (
  id: number
): Promise<MaeilMailQuestion | null> => {
  const sourceUrl = `${BASE_URL}/${id}`;

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      console.warn(`[파서] ID ${id}: HTTP ${response.status}`);
      return null;
    }

    const html = await response.text();

    // 질문 제목 추출
    const question = extractQuestion(html);
    if (!question) {
      console.warn(`[파서] ID ${id}: 질문 제목을 찾을 수 없습니다.`);
      return null;
    }

    // 카테고리 추출
    const category = extractCategory(html);

    // 답변 본문 추출: 1차 RSC 페이로드, 2차 HTML 파싱
    let answer = extractContentFromRscPayload(html);
    if (!answer) {
      console.warn(
        `[파서] ID ${id}: RSC 페이로드에서 답변을 찾을 수 없습니다. HTML 파싱 시도...`
      );
      answer = extractContentFromHtml(html);
    }

    if (!answer) {
      console.warn(`[파서] ID ${id}: 답변 본문을 추출할 수 없습니다.`);
      return null;
    }

    // 참고자료 추출
    const references = extractReferences(answer);

    return {
      id,
      question,
      category,
      answer,
      references,
      sourceUrl,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[파서] ID ${id}: 파싱 실패 - ${message}`);
    return null;
  }
};

/**
 * 범위 ID의 매일메일 질문을 파싱한다.
 */
export const parseMaeilMailRange = async (
  startId: number,
  endId: number,
  options?: { delayMs?: number }
): Promise<MaeilMailQuestion[]> => {
  const delayMs = options?.delayMs ?? 1000;
  const results: MaeilMailQuestion[] = [];

  console.log(`[파서] ID ${startId} ~ ${endId} 파싱 시작 (딜레이: ${delayMs}ms)`);

  for (let id = startId; id <= endId; id++) {
    const result = await parseMaeilMailQuestion(id);
    if (result) {
      results.push(result);
      console.log(`  [성공] ID ${id}: ${result.question.slice(0, 40)}...`);
    } else {
      console.log(`  [건너뜀] ID ${id}`);
    }

    // 마지막 요청이 아니면 딜레이
    if (id < endId) {
      await delay(delayMs);
    }
  }

  console.log(
    `[파서] 완료: ${results.length}개 성공 / ${endId - startId + 1}개 시도`
  );
  return results;
};
