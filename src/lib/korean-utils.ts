/**
 * 한국어 전처리 유틸리티
 * - 조사 제거 (은/는/이/가/을/를/에/의/와/과/로/으로/에서 등)
 * - 검색 쿼리와 FTS 콘텐츠 양쪽에 적용
 */

// 한국어 조사 패턴 (단어 뒤에 붙는 조사를 제거)
// 긴 조사부터 매칭하여 "으로" 가 "로" 보다 먼저 매칭되도록 함
const JOSA_PATTERN =
  /(?<=[\uAC00-\uD7A3])(으로서|으로써|에서는|에서도|으로는|으로도|에서의|로서|로써|에서|까지|부터|마다|조차|처럼|만큼|대로|보다|에게|한테|에는|에도|와는|과는|으로|이란|이나|에의|는|은|이|가|을|를|에|의|와|과|로|도|만|며|고|나|든)(?=\s|$|[^가-힣])/g;

/**
 * 한국어 텍스트에서 조사를 제거합니다.
 * 예: "트랜잭션을 관리하는 패턴에서" → "트랜잭션 관리하는 패턴"
 */
export const removeJosa = (text: string): string => {
  return text.replace(JOSA_PATTERN, "");
};

/**
 * 검색 쿼리를 전처리합니다.
 * 1. 양쪽 공백 제거
 * 2. 한국어 조사 제거
 * 3. 연속 공백 정리
 */
export const preprocessQuery = (query: string): string => {
  const trimmed = query.trim();
  const withoutJosa = removeJosa(trimmed);
  return withoutJosa.replace(/\s+/g, " ").trim();
};

/**
 * FTS용 콘텐츠 텍스트를 전처리합니다.
 * 한국어 조사를 제거하여 키워드 매칭 정확도를 높입니다.
 */
export const preprocessContent = (content: string): string => {
  const withoutJosa = removeJosa(content);
  return withoutJosa.replace(/\s+/g, " ").trim();
};
