import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { BOT_REGEX, generateFingerprint } from "@/lib/fingerprint";

/**
 * POST /api/stats
 * 방문자 fingerprint 기록 (글 상세가 아닌 일반 페이지 방문 시)
 */
export const POST = async (request: NextRequest) => {
  try {
    const ua = request.headers.get("user-agent") ?? "";

    // 봇 필터링
    if (!ua || BOT_REGEX.test(ua)) {
      return NextResponse.json({ ok: true });
    }

    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch {
      return NextResponse.json({ ok: true });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    const fingerprint = await generateFingerprint(ip, ua);
    const today = new Date().toISOString().split("T")[0];

    await supabase
      .from("visitors")
      .upsert(
        { fingerprint, visited_date: today },
        { onConflict: "fingerprint,visited_date", ignoreDuplicates: true }
      );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/stats error:", error);
    return NextResponse.json({ ok: true });
  }
};

/**
 * GET /api/stats
 * 일별/총 방문자 통계 조회
 */
export const GET = async () => {
  try {
    let supabase;
    try {
      supabase = createSupabaseClient();
    } catch {
      return NextResponse.json({ daily: 0, total: 0 });
    }

    const today = new Date().toISOString().split("T")[0];

    // 오늘 방문자 수
    const { count: daily } = await supabase
      .from("visitors")
      .select("*", { count: "exact", head: true })
      .eq("visited_date", today);

    // 총 유니크 방문자 수 (고유 fingerprint 수)
    const { data: totalData } = await supabase
      .from("visitors")
      .select("fingerprint");

    const uniqueFingerprints = new Set(
      (totalData ?? []).map((row: { fingerprint: string }) => row.fingerprint)
    );

    return NextResponse.json(
      { daily: daily ?? 0, total: uniqueFingerprints.size },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ daily: 0, total: 0 });
  }
};
