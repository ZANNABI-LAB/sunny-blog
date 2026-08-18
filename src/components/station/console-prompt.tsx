"use client";

import { useState } from "react";
import { askDeepThought } from "@/lib/ask-event";

const SUGGESTIONS = ["JPA N+1이 뭐야?", "인덱스는 언제 걸어?", "CORS 정리해줘"];

/**
 * 에어록 창 안의 콘솔.
 *
 * 질문을 제출하면 챗봇 패널이 열리며 그 질문이 그대로 전송된다.
 * 챗봇을 구석의 부가기능이 아니라 메인의 입구로 올리는 장치다.
 */
const ConsolePrompt = () => {
  const [value, setValue] = useState("");

  const submit = (question: string) => {
    const q = question.trim();
    if (!q) return;
    askDeepThought(q);
    setValue("");
  };

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="font-display text-caption tracking-[0.2em] text-accent">
        DEEP THOUGHT CONSOLE
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="flex w-full items-center gap-2 border-2 border-accent bg-bg-primary/85 px-3 py-2.5 backdrop-blur-[2px]"
      >
        <span aria-hidden="true" className="font-display text-caption text-accent">
          &gt;
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="무엇이든 물어보세요"
          aria-label="Deep Thought에게 질문하기"
          className="font-display min-w-0 flex-1 bg-transparent text-caption text-text-primary placeholder:text-text-muted outline-none"
        />
        <button
          type="submit"
          className="font-display shrink-0 border-2 border-accent px-2 py-1 text-caption text-accent transition-colors hover:bg-accent hover:text-text-inverse focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
        >
          ASK
        </button>
      </form>

      <ul className="flex flex-wrap justify-center gap-1.5">
        {SUGGESTIONS.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => submit(q)}
              className="font-display border-2 border-border px-2 py-1 text-caption text-text-muted transition-colors hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConsolePrompt;
