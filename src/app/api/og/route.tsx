import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Deep Thought";
  const category = searchParams.get("category") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          backgroundColor: "#070709",
          color: "#fafaf9",
          fontFamily: "monospace",
        }}
      >
        {/* Top: Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{ fontSize: "24px", color: "#fbbf24", fontWeight: 700 }}
          >
            &gt;_
          </span>
          <span
            style={{
              fontSize: "20px",
              color: "#a8a29e",
              letterSpacing: "0.15em",
            }}
          >
            DEEP THOUGHT
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            marginTop: "40px",
            fontSize: "48px",
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: "900px",
            wordBreak: "break-word",
          }}
        >
          {title}
        </div>

        {/* Category badge */}
        {category && (
          <div
            style={{
              marginTop: "32px",
              display: "flex",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                color: "#fbbf24",
                border: "1px solid #fbbf2440",
                borderRadius: "6px",
                padding: "4px 16px",
                letterSpacing: "0.1em",
              }}
            >
              {category}
            </span>
          </div>
        )}

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "80px",
            fontSize: "14px",
            color: "#78716c",
            letterSpacing: "0.1em",
          }}
        >
          The answer to the ultimate question of life, the universe, and code.
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
};
