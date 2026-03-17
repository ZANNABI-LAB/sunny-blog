import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import TabNav from "@/components/tab-nav";
import LayoutShell from "@/components/layout-shell";
import ThemeProvider from "@/components/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL("https://deep-thought.space"),
  title: {
    default: "Deep Thought",
    template: "%s | Deep Thought",
  },
  description:
    "The answer to the ultimate question of life, the universe, and code.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Deep Thought",
    title: "Deep Thought",
    description:
      "The answer to the ultimate question of life, the universe, and code.",
    images: [
      {
        url: "/api/og?title=Deep%20Thought",
        width: 1200,
        height: 630,
        alt: "Deep Thought",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deep Thought",
    description:
      "The answer to the ultimate question of life, the universe, and code.",
    images: ["/api/og?title=Deep%20Thought"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "Rb4p0xrGmuz3tPkebAeRxpWCLbaG5ffXvDn8yoJUQ6c",
    other: {
      "naver-site-verification": "be210a5940ac2c67d682e36441a60b385f3354a5",
    },
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
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
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="flex flex-col h-full bg-bg-primary text-text-primary font-sans noise-overlay nebula-bg">
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-SEG9MW5TKD"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-SEG9MW5TKD');`}
        </Script>
        {process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true" && (
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6873591317343081"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  name: "Deep Thought",
                  url: "https://deep-thought.space",
                  inLanguage: "ko",
                  description:
                    "The answer to the ultimate question of life, the universe, and code.",
                },
                {
                  "@type": "Person",
                  name: "신중선",
                  url: "https://deep-thought.space/profile",
                  jobTitle: "Backend Developer",
                },
              ],
            }),
          }}
        />
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-indigo-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
          >
            메인 콘텐츠로 건너뛰기
          </a>
          <TabNav />
          <LayoutShell>
            {children}
          </LayoutShell>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
