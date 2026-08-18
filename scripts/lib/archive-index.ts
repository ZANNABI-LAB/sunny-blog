/**
 * 아카이브 인덱스 (scripts/data/archive-index.json) 로드/저장 유틸.
 *
 * 인덱스는 아카이브 콘텐츠별 수입 상태의 SSOT다:
 *   imported - 구 사이트 시절 이미 포스트로 생성됨
 *   pending  - 아직 포스트로 만들지 않음 (자동 생성 대상)
 *   done     - 아카이브 기반 파이프라인으로 생성 완료
 *   failed   - 생성 시도 실패 (재시도 대상 아님, 수동 확인 필요)
 */
import fs from "fs";
import path from "path";

import type { ArchiveTrack } from "./archive-parser";

export type ArchiveEntryStatus = "imported" | "pending" | "done" | "failed";

export interface ArchiveIndexEntry {
  key: string; // "be-1", "fe-23"
  track: ArchiveTrack;
  title: string;
  category: string; // 아카이브 세부 카테고리
  status: ArchiveEntryStatus;
  slug?: string; // done인 경우 생성된 포스트 slug
  error?: string; // failed인 경우 사유
}

export interface ArchiveIndex {
  entries: ArchiveIndexEntry[];
  lastUpdated: string;
}

export const ARCHIVE_INDEX_PATH = path.join(
  process.cwd(),
  "scripts",
  "data",
  "archive-index.json"
);

export const loadArchiveIndex = (): ArchiveIndex => {
  if (!fs.existsSync(ARCHIVE_INDEX_PATH)) {
    return { entries: [], lastUpdated: "" };
  }
  return JSON.parse(
    fs.readFileSync(ARCHIVE_INDEX_PATH, "utf-8")
  ) as ArchiveIndex;
};

export const saveArchiveIndex = (index: ArchiveIndex): void => {
  const dir = path.dirname(ARCHIVE_INDEX_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  index.lastUpdated = new Date().toISOString();
  fs.writeFileSync(ARCHIVE_INDEX_PATH, JSON.stringify(index, null, 2));
};

/** 특정 엔트리의 상태를 갱신하고 저장한다. */
export const updateEntryStatus = (
  key: string,
  status: ArchiveEntryStatus,
  extra?: { slug?: string; error?: string }
): void => {
  const index = loadArchiveIndex();
  const entry = index.entries.find((e) => e.key === key);
  if (!entry) {
    throw new Error(`아카이브 인덱스에 없는 key: ${key}`);
  }
  entry.status = status;
  if (extra?.slug) entry.slug = extra.slug;
  if (extra?.error) entry.error = extra.error;
  saveArchiveIndex(index);
};
