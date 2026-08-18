/**
 * 아카이브 인덱스 빌더 (일회성 + 갱신용)
 *
 * maeil-mail-contents GitHub 아카이브의 전체 목차를 가져와,
 * 기존에 구 사이트(question ID) 기반으로 생성된 포스트와 대조해
 * 미수입(pending) 목록을 scripts/data/archive-index.json에 기록한다.
 *
 * 대조 방법: processed-ids.json의 각 질문 ID로 구 사이트에서 질문 제목을
 * 가져와(아직 200 응답) 아카이브 목차 제목과 정규화 비교한다.
 * 구 사이트가 내려가도 이미 커밋된 인덱스가 있으면 목차 갱신만 수행한다.
 *
 * 사용법:
 *   npx tsx scripts/build-archive-index.ts            # 인덱스 생성/갱신
 *   npx tsx scripts/build-archive-index.ts --refresh  # 목차만 다시 대조 (기존 상태 보존)
 */
import fs from "fs";
import path from "path";

import { fetchArchiveEntries } from "./lib/archive-parser";
import { parseMaeilMailQuestion } from "./lib/maeil-mail-parser";
import {
  ARCHIVE_INDEX_PATH,
  loadArchiveIndex,
  saveArchiveIndex,
  type ArchiveIndex,
  type ArchiveIndexEntry,
} from "./lib/archive-index";

const PROCESSED_IDS_PATH = path.join(
  process.cwd(),
  "scripts",
  "data",
  "processed-ids.json"
);

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 제목 정규화: 공백/문장부호 제거 + 소문자화 (한글/영문/숫자만 유지) */
export const normalizeTitle = (title: string): string =>
  title.toLowerCase().replace(/[^가-힣a-z0-9]/g, "");

const main = async (): Promise<void> => {
  const refreshOnly = process.argv.includes("--refresh");

  console.log("[인덱스] 아카이브 목차 가져오는 중...");
  const entries = await fetchArchiveEntries();
  console.log(`[인덱스] 아카이브 콘텐츠 ${entries.length}개 발견`);

  const existing = loadArchiveIndex();
  const existingByKey = new Map(existing.entries.map((e) => [e.key, e]));

  // 구 사이트에서 처리된 질문 제목 수집 (인덱스가 이미 있으면 건너뜀)
  const importedTitles = new Set<string>();
  const needSiteScan = !refreshOnly && existing.entries.length === 0;

  if (needSiteScan) {
    const raw = fs.readFileSync(PROCESSED_IDS_PATH, "utf-8");
    const { processedIds } = JSON.parse(raw) as { processedIds: number[] };
    console.log(
      `[인덱스] 구 사이트에서 처리된 질문 ${processedIds.length}개의 제목 수집 중...`
    );

    let failed = 0;
    for (const id of processedIds) {
      const question = await parseMaeilMailQuestion(id);
      if (question) {
        importedTitles.add(normalizeTitle(question.question));
      } else {
        failed++;
      }
      await delay(300);
    }
    console.log(
      `[인덱스] 제목 수집 완료 (성공 ${importedTitles.size}, 실패 ${failed})`
    );
    if (failed > 0) {
      console.warn(
        `[인덱스] 경고: ${failed}개 질문의 제목을 가져오지 못했습니다. 해당 콘텐츠는 pending으로 남아 중복 생성될 수 있습니다.`
      );
    }
  }

  const nextEntries: ArchiveIndexEntry[] = entries.map((entry) => {
    const prev = existingByKey.get(entry.key);
    if (prev) {
      // 기존 상태 보존, 목차 메타데이터만 갱신
      return { ...prev, title: entry.title, category: entry.category };
    }
    const isImported =
      needSiteScan && importedTitles.has(normalizeTitle(entry.title));
    return {
      key: entry.key,
      track: entry.track,
      title: entry.title,
      category: entry.category,
      status: isImported ? "imported" : "pending",
    };
  });

  const index: ArchiveIndex = {
    entries: nextEntries,
    lastUpdated: new Date().toISOString(),
  };
  saveArchiveIndex(index);

  const counts = nextEntries.reduce(
    (acc, e) => {
      acc[e.status] = (acc[e.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log(`[인덱스] 저장 완료: ${ARCHIVE_INDEX_PATH}`);
  console.log(
    `[인덱스] 상태: imported ${counts.imported ?? 0} / done ${counts.done ?? 0} / pending ${counts.pending ?? 0} / failed ${counts.failed ?? 0}`
  );
};

main().catch((err) => {
  console.error("[인덱스] 실패:", err);
  process.exit(1);
});
