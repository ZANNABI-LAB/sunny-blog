"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const GISCUS_CONFIG = {
  repo: "ZANNABI-LAB/sunny-blog" as `${string}/${string}`,
  repoId: "R_kgDORe8GhA",
  category: "Announcements",
  categoryId: "DIC_kwDORe8GhM4C4D8B",
};

const GiscusComments = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!ref.current) return;

    const giscusTheme = resolvedTheme === "dark" ? "dark_dimmed" : "light";

    // 기존 iframe이 있으면 테마만 업데이트
    const existingIframe = ref.current.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );
    if (existingIframe) {
      existingIframe.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: giscusTheme } } },
        "https://giscus.app"
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", GISCUS_CONFIG.repo);
    script.setAttribute("data-repo-id", GISCUS_CONFIG.repoId);
    script.setAttribute("data-category", GISCUS_CONFIG.category);
    script.setAttribute("data-category-id", GISCUS_CONFIG.categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", giscusTheme);
    script.setAttribute("data-lang", "ko");
    script.setAttribute("data-loading", "lazy");
    script.crossOrigin = "anonymous";
    script.async = true;

    ref.current.appendChild(script);
  }, [resolvedTheme]);

  return <div ref={ref} className="mt-12 pt-8 border-t border-border" />;
};

export default GiscusComments;
