/**
 * 메인 콘솔 → 챗봇 위젯 사이의 단방향 신호.
 *
 * 두 컴포넌트는 트리 상 형제라 상태를 직접 넘길 수 없다. 전역 상태 라이브러리를
 * 새로 들이는 대신(리뉴얼 원칙: 신규 의존성 금지) 커스텀 이벤트 하나로 잇는다.
 */
export const ASK_EVENT = "deepthought:ask";

/** 챗봇 패널을 열고, 질문이 있으면 그대로 전송한다 */
export const askDeepThought = (question?: string) => {
  window.dispatchEvent(
    new CustomEvent<string | undefined>(ASK_EVENT, { detail: question })
  );
};
