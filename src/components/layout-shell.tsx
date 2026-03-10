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
      <main
        id="main-content"
        className={`w-full ${isMainPage ? "relative h-[calc(100dvh-var(--nav-height))] overflow-hidden" : "flex-1 px-4 py-8"}`}
      >
        {children}
        {isMainPage && (
          <div className="absolute bottom-0 left-0 right-0">
            <Footer />
          </div>
        )}
      </main>
      {!isMainPage && <Footer />}
      <ChatbotWidget isMainPage={isMainPage} />
    </>
  );
};

export default LayoutShell;
