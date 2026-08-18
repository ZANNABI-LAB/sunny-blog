"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/footer";
import ChatbotWidget from "@/components/chatbot-widget";

type LayoutShellProps = {
  children: React.ReactNode;
};

const LayoutShell = ({ children }: LayoutShellProps) => {
  const pathname = usePathname();
  const isMainPage = pathname === "/";

  return (
    <>
      {/* 메인(관제 콘솔)은 데스크톱에서 한 화면에 담기지만, 모바일에서는 패널이
          세로로 쌓이므로 스크롤을 막지 않는다 */}
      <main
        id="main-content"
        className={`w-full ${isMainPage ? "relative flex-1 md:h-[calc(100dvh-var(--nav-height))] md:flex-none md:overflow-hidden" : "flex-1 px-4 py-8"}`}
      >
        {children}
        {/* 데스크톱 메인은 한 화면에 고정되므로 풋터를 바닥에 겹쳐 놓는다 */}
        {isMainPage && (
          <div className="absolute bottom-0 left-0 right-0 hidden md:block">
            <Footer />
          </div>
        )}
      </main>
      {!isMainPage && <Footer />}
      {/* 모바일 메인은 스크롤되므로 풋터가 문서 흐름에 그대로 붙는다 */}
      {isMainPage && (
        <div className="md:hidden">
          <Footer />
        </div>
      )}
      <ChatbotWidget isMainPage={isMainPage} />
    </>
  );
};

export default LayoutShell;
