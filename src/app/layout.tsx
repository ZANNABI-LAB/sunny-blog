import type { Metadata } from "next";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import TabNav from "@/components/tab-nav";
import Footer from "@/components/footer";
import ChatbotWidget from "@/components/chatbot-widget";

export const metadata: Metadata = {
  title: "Sunny's Blog",
  description: "One small step for a monkey, one giant leap for code",
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[#0a0a0f] text-white font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-indigo-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
        >
          메인 콘텐츠로 건너뛰기
        </a>
        <TabNav />
        <main id="main-content" className="flex-1 w-full px-4 py-8">
          {children}
        </main>
        <Footer />
        <ChatbotWidget />
      </body>
    </html>
  );
};

export default RootLayout;
