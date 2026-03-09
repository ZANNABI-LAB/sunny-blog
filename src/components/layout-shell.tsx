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
      <main id="main-content" className="flex-1 w-full px-4 py-8">
        {children}
      </main>
      {!isMainPage && <Footer />}
      <ChatbotWidget isMainPage={isMainPage} />
    </>
  );
};

export default LayoutShell;
