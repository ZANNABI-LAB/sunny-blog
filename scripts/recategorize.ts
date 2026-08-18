/**
 * 기존 포스트 서브카테고리 일괄 재분류 스크립트 (리뉴얼 Phase 2).
 *
 * scripts/data/recategorize-map.json의 slug -> category 매핑을 읽어
 * 각 포스트 frontmatter의 category를 갱신한다. 이미 목표값이면 건너뛴다.
 * root 카테고리가 바뀌는 항목이 있으면 경고를 출력한다 (의도 확인용).
 *
 * 사용법: npx tsx scripts/recategorize.ts [--dry-run]
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";

import { CATEGORIES, getCategoryRoot } from "../src/lib/categories";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const MAP_PATH = path.join(
  process.cwd(),
  "scripts",
  "data",
  "recategorize-map.json"
);

const main = (): void => {
  const dryRun = process.argv.includes("--dry-run");
  const { map } = JSON.parse(fs.readFileSync(MAP_PATH, "utf-8")) as {
    map: Record<string, string>;
  };

  let changed = 0;
  let skipped = 0;
  let missing = 0;

  for (const [slug, nextCategory] of Object.entries(map)) {
    const filePath = path.join(POSTS_DIR, `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      console.warn(`[누락] ${slug}: 파일 없음`);
      missing++;
      continue;
    }

    const root = getCategoryRoot(nextCategory);
    if (!(CATEGORIES as string[]).includes(root)) {
      throw new Error(`유효하지 않은 root 카테고리: ${nextCategory} (${slug})`);
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(raw);
    const current = (data.category as string) ?? "";

    if (current === nextCategory) {
      skipped++;
      continue;
    }

    if (getCategoryRoot(current) !== root) {
      console.warn(
        `[경고] ${slug}: root 변경 ${current} -> ${nextCategory}`
      );
    }

    // frontmatter의 category 줄만 교체 (다른 포매팅 보존)
    const updated = raw.replace(
      /^category: .*$/m,
      `category: "${nextCategory}"`
    );
    if (updated === raw) {
      console.warn(`[경고] ${slug}: category 줄을 찾지 못했습니다.`);
      continue;
    }

    if (!dryRun) {
      fs.writeFileSync(filePath, updated, "utf-8");
    }
    console.log(`[변경] ${slug}: ${current} -> ${nextCategory}`);
    changed++;
  }

  console.log(
    `\n완료${dryRun ? " (dry-run)" : ""}: 변경 ${changed} / 동일 ${skipped} / 누락 ${missing}`
  );
};

main();
