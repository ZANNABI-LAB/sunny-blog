"use client";

import { useEffect } from "react";

const CodeBlockEnhancer = () => {
  useEffect(() => {
    const pres = document.querySelectorAll("article.prose pre");

    pres.forEach((pre) => {
      const preEl = pre as HTMLElement;

      // Skip if already enhanced
      if (preEl.dataset.copyBtn) return;
      preEl.dataset.copyBtn = "true";

      // Add mobile code block class
      preEl.classList.add("code-block-mobile");

      // Wrap in relative container
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      preEl.parentNode?.insertBefore(wrapper, preEl);
      wrapper.appendChild(preEl);

      // Create copy button
      const btn = document.createElement("button");
      btn.setAttribute("aria-label", "코드 복사");
      btn.style.cssText =
        "position:absolute;top:8px;right:8px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:6px;border:1px solid var(--border-subtle);background:var(--bg-elevated,#0a0a0f);opacity:0.8;color:var(--text-muted);cursor:pointer;transition:opacity 150ms;";

      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

      const checkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

      btn.addEventListener("mouseenter", () => {
        btn.style.opacity = "1";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.opacity = "0.8";
      });

      btn.addEventListener("click", () => {
        const code = preEl.querySelector("code");
        const text = code?.textContent ?? preEl.textContent ?? "";
        navigator.clipboard.writeText(text).then(() => {
          const originalHtml = btn.innerHTML;
          btn.innerHTML = checkSvg;
          btn.style.color = "var(--accent-primary)";
          setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.color = "var(--text-muted)";
          }, 2000);
        });
      });

      wrapper.appendChild(btn);
    });
  }, []);

  return null;
};

export default CodeBlockEnhancer;
