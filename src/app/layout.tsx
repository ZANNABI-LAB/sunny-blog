import type { Metadata, Viewport } from "next";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import TabNav from "@/components/tab-nav";
import Footer from "@/components/footer";
import ChatbotWidget from "@/components/chatbot-widget";
import ThemeProvider from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Deep Thought",
  description: "The answer to the ultimate question of life, the universe, and code.",
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-bg-primary text-text-primary font-sans noise-overlay nebula-bg">
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
