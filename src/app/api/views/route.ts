import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

const BOT_REGEX =
  /bot|crawler|spider|crawling|googlebot|bingbot|yandex|baidu|slurp/i;

/**
 * IP + User-Agent 문자열을 SHA-256 해시로 변환한다.
 */
const generateFingerprint = async (ip: string, ua: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}:${ua}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * POST /api/views
 * 글 조회수 증가 + 방문자 기록
 */
export const POST = async (request: NextRequest) => {
  try {
    const { slug } = await request.json();

    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "slug is required" },
        { status: 400 }
      );
    }

    const ua = request.headers.get("user-agent") ?? "";

    // 봇 필터링
    if (!ua || BOT_REGEX.test(ua)) {
      return NextResponse.json({ viewCount: 0 });
    }

    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch {
      // Supabase 미설정 시 graceful 실패
      return NextResponse.json({ viewCount: 0 });
    }

    // 1. page_views upsert (조회수 증가)
    const { data: existing } = await supabase
      .from("page_views")
      .select("view_count")
      .eq("slug", slug)
      .single();

    let viewCount: number;

    if (existing) {
      const newCount = existing.view_count + 1;
      await supabase
        .from("page_views")
        .update({ view_count: newCount, updated_at: new Date().toISOString() })
        .eq("slug", slug);
      viewCount = newCount;
    } else {
      await supabase
        .from("page_views")
        .insert({ slug, view_count: 1 });
      viewCount = 1;
    }

    // 2. 방문자 fingerprint 기록
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const fingerprint = await generateFingerprint(ip, ua);
    const today = new Date().toISOString().split("T")[0];

    // UNIQUE(fingerprint, visited_date) 제약으로 중복 무시
    await supabase
      .from("visitors")
      .upsert(
        { fingerprint, visited_date: today },
        { onConflict: "fingerprint,visited_date", ignoreDuplicates: true }
      );

    return NextResponse.json({ viewCount });
  } catch (error) {
    console.error("POST /api/views error:", error);
    return NextResponse.json({ viewCount: 0 });
  }
};

/**
 * GET /api/views?slug=tech/my-post
 * GET /api/views?slugs=tech/post-1,tech/post-2
 */
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const slugs = searchParams.get("slugs");

    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch {
      if (slug) return NextResponse.json({ viewCount: 0 });
      return NextResponse.json({ views: {} });
    }

    // 단일 slug 조회
    if (slug) {
      const { data } = await supabase
        .from("page_views")
        .select("view_count")
        .eq("slug", slug)
        .single();

      return NextResponse.json(
        { viewCount: data?.view_count ?? 0 },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    // 복수 slugs 조회
    if (slugs) {
      const slugList = slugs.split(",").filter(Boolean);
      const { data } = await supabase
        .from("page_views")
        .select("slug, view_count")
        .in("slug", slugList);

      const views: Record<string, number> = {};
      for (const row of data ?? []) {
        views[row.slug] = row.view_count;
      }

      return NextResponse.json(
        { views },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    return NextResponse.json(
      { error: "slug or slugs parameter is required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("GET /api/views error:", error);
    return NextResponse.json({ viewCount: 0 });
  }
};
