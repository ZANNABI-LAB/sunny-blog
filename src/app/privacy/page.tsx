import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "Deep Thought 블로그의 개인정보처리방침",
  alternates: {
    canonical: "https://deep-thought.space/privacy",
  },
};

const PrivacyPage = () => {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <article className="prose prose-invert prose-sm sm:prose-base max-w-none">
        <h1>개인정보처리방침</h1>
        <p className="text-text-muted">최종 수정일: 2026년 3월 17일</p>

        <p>
          Deep Thought(이하 &quot;본 블로그&quot;)는 이용자의 개인정보를
          중요시하며, 관련 법령에 따라 개인정보를 보호하고 있습니다. 본
          개인정보처리방침은 본 블로그가 수집하는 정보와 그 이용 방식을
          안내합니다.
        </p>

        <h2>1. 수집하는 정보</h2>

        <h3>가. 자동 수집 정보</h3>
        <ul>
          <li>
            <strong>Google Analytics</strong>: 방문 페이지, 체류 시간, 브라우저
            정보, 기기 유형 등 익명화된 방문 통계
          </li>
          <li>
            <strong>페이지뷰 카운트</strong>: 각 게시글의 조회수(IP 주소를
            저장하지 않음)
          </li>
          <li>
            <strong>Google AdSense</strong>: 맞춤 광고 제공을 위한 쿠키 및 웹
            비콘
          </li>
        </ul>

        <h3>나. 이용자 제공 정보</h3>
        <ul>
          <li>
            <strong>챗봇 대화</strong>: AI 챗봇과의 대화 내용(대화 종료 시
            서버에 저장되지 않음)
          </li>
          <li>
            <strong>댓글(Giscus)</strong>: GitHub 계정을 통한 댓글 작성 시 GitHub
            프로필 정보(GitHub Discussions에 저장)
          </li>
        </ul>

        <h2>2. 수집 목적</h2>
        <ul>
          <li>블로그 방문 통계 분석 및 콘텐츠 개선</li>
          <li>AI 챗봇 서비스 제공</li>
          <li>댓글을 통한 소통</li>
          <li>광고 서비스 운영</li>
        </ul>

        <h2>3. 제3자 제공</h2>
        <p>
          본 블로그는 이용자의 개인정보를 제3자에게 직접 제공하지 않습니다. 단,
          아래 외부 서비스를 이용하며, 각 서비스의 개인정보처리방침이 적용됩니다.
        </p>
        <ul>
          <li>
            <strong>Google Analytics / AdSense</strong>:{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google 개인정보처리방침
            </a>
          </li>
          <li>
            <strong>Supabase</strong>:{" "}
            <a
              href="https://supabase.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase 개인정보처리방침
            </a>
          </li>
          <li>
            <strong>GitHub (Giscus)</strong>:{" "}
            <a
              href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub 개인정보처리방침
            </a>
          </li>
        </ul>

        <h2>4. 쿠키 사용</h2>
        <p>
          본 블로그는 Google Analytics 및 Google AdSense를 통해 쿠키를
          사용합니다. 이용자는 브라우저 설정에서 쿠키를 비활성화할 수 있으며, 이
          경우 일부 기능이 제한될 수 있습니다.
        </p>
        <ul>
          <li>
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Analytics 수집 거부
            </a>
          </li>
          <li>
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google 광고 설정 관리
            </a>
          </li>
        </ul>

        <h2>5. 보유 기간</h2>
        <ul>
          <li>
            <strong>Google Analytics 데이터</strong>: Google 정책에 따름(기본 14개월)
          </li>
          <li>
            <strong>페이지뷰 카운트</strong>: 블로그 운영 기간 동안 보유
          </li>
          <li>
            <strong>챗봇 대화</strong>: 세션 종료 시 삭제(서버 미저장)
          </li>
          <li>
            <strong>댓글</strong>: GitHub Discussions에서 이용자가 직접
            삭제 가능
          </li>
        </ul>

        <h2>6. 이용자의 권리</h2>
        <ul>
          <li>브라우저 쿠키 설정을 통한 추적 거부</li>
          <li>Google 계정 설정을 통한 광고 개인화 거부</li>
          <li>GitHub에서 댓글 직접 수정 및 삭제</li>
          <li>아래 연락처를 통한 개인정보 관련 문의</li>
        </ul>

        <h2>7. 개인정보 보호책임자</h2>
        <ul>
          <li>
            <strong>성명</strong>: 신중선
          </li>
          <li>
            <strong>이메일</strong>: sjs920818@gmail.com
          </li>
        </ul>

        <h2>8. 방침 변경</h2>
        <p>
          본 개인정보처리방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며,
          변경 시 본 페이지에 게시합니다.
        </p>
      </article>
    </main>
  );
};

export default PrivacyPage;
