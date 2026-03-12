import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

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
