import type { Metadata } from "next";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import TabNav from "@/components/tab-nav";

export const metadata: Metadata = {
  title: "Sunny Blog",
  description: "Sunny's personal tech blog",
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="ko">
      <body className="flex flex-col min-h-screen bg-[#0a0a0f] text-white">
        <TabNav />
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
