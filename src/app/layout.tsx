import type { Metadata } from "next";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import TabNav from "@/components/tab-nav";
import Footer from "@/components/footer";

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
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-[#0a0a0f] text-white font-sans">
        <TabNav />
        <main className="flex-1 w-full px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;
