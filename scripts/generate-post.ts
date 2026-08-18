/**
 * 아카이브 기반 포스트 자동 생성 메인 스크립트.
 *
 * 매일메일 서비스 종료 이후, 콘텐츠는 GitHub 아카이브
 * (maeil-mail/maeil-mail-contents)에서 가져온다. 수입 상태는
 * scripts/data/archive-index.json이 SSOT다 (build-archive-index.ts로 생성).
 *
 * 사용법:
 *   npm run generate-post -- --latest              # pending 1개 생성
 *   npm run generate-post -- --latest --count 3    # pending 최대 3개 생성
 *   npm run generate-post -- --key be-12           # 특정 콘텐츠 생성
 */
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import matter from "gray-matter";
import { fetchArchiveQuestion } from "./lib/archive-parser";
import {
  loadArchiveIndex,
  updateEntryStatus,
  type ArchiveIndexEntry,
} from "./lib/archive-index";
import { generatePost } from "./lib/post-generator";
import { upsertEmbedding } from "./lib/embedding-utils";
import { notifySlack } from "./lib/notify";

// ─── 상수 ───────────────────────────────────────────────

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const REQUEST_DELAY_MS = 1000;

interface ProcessResult {
  key: string;
  status: "success" | "skipped" | "failed";
  filename?: string;
  error?: string;
}

// ─── 기존 slug 수집 ─────────────────────────────────────

const getExistingSlugs = (): string[] => {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.basename(f, ".md"));
};

// ─── 단일 콘텐츠 처리 ───────────────────────────────────

const processEntry = async (
  entry: ArchiveIndexEntry,
  existingSlugs: string[]
): Promise<ProcessResult> => {
  const { key } = entry;

  // 1. 아카이브에서 콘텐츠 가져오기
  console.log(`[아카이브] ${key} 가져오는 중... (${entry.title.slice(0, 40)})`);
  const question = await fetchArchiveQuestion(entry);
  if (!question) {
    updateEntryStatus(key, "failed", { error: "아카이브 콘텐츠 파싱 실패" });
    return { key, status: "failed", error: "아카이브 콘텐츠 파싱 실패" };
  }

  // 2. Claude로 포스트 생성
  console.log(`[생성] Claude API 호출 중...`);
  const post = await generatePost(
    {
      sourceId: question.key,
      question: question.title,
      category: question.category || question.track,
      answer: question.answer,
      sourceUrl: question.sourceUrl,
    },
    { existingSlugs }
  );
  console.log(`  slug: ${post.slug}`);

  // 3. 파일 저장
  const filePath = path.join(POSTS_DIR, post.filename);
  fs.writeFileSync(filePath, post.content, "utf-8");
  console.log(`  [저장] ${filePath}`);
  existingSlugs.push(post.slug);

  // 4. 임베딩 생성 (실패해도 포스트 파일은 유지)
  try {
    console.log(`[임베딩] 임베딩 생성 중...`);
    const { content: mdContent } = matter(post.content);
    await upsertEmbedding({
      slug: post.slug,
      title: post.frontmatter.title,
      summary: post.frontmatter.summary,
      content: mdContent,
    });
    console.log(`  [성공] 임베딩 저장 완료`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`  [경고] 임베딩 생성 실패 (포스트 파일은 저장됨): ${message}`);
  }

  // 5. 인덱스 상태 갱신
  updateEntryStatus(key, "done", { slug: post.slug });

  return { key, status: "success", filename: post.filename };
};

// ─── CLI 인자 파싱 ──────────────────────────────────────

interface CliArgs {
  mode: "latest" | "key";
  key?: string;
  count?: number;
}

const parseArgs = (): CliArgs => {
  const args = process.argv.slice(2);

  const getArgValue = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    if (idx === -1 || idx + 1 >= args.length) return undefined;
    return args[idx + 1];
  };

  if (args.includes("--latest")) {
    const countStr = getArgValue("--count");
    const count = countStr ? parseInt(countStr, 10) : 1;
    if (isNaN(count) || count <= 0) {
      console.error("오류: --count 값이 유효한 양의 정수가 아닙니다.");
      process.exit(1);
    }
    return { mode: "latest", count };
  }

  const key = getArgValue("--key");
  if (key) {
    if (!/^(be|fe)-\d+$/.test(key)) {
      console.error(`오류: --key 형식이 잘못되었습니다 (예: be-12, fe-3): ${key}`);
      process.exit(1);
    }
    return { mode: "key", key };
  }

  console.error(`사용법:
  npm run generate-post -- --latest              # pending 1개 생성
  npm run generate-post -- --latest --count <n>  # pending 최대 N개 생성
  npm run generate-post -- --key <be-N|fe-N>     # 특정 콘텐츠 생성`);
  process.exit(1);
};

// ─── 최종 리포트 ────────────────────────────────────────

const printReport = (results: ProcessResult[]): void => {
  const success = results.filter((r) => r.status === "success");
  const skipped = results.filter((r) => r.status === "skipped");
  const failed = results.filter((r) => r.status === "failed");

  console.log("\n=== 포스트 생성 완료 ===");
  console.log(`처리 대상: ${results.length}개`);
  console.log(`성공: ${success.length}개`);
  console.log(`건너뜀: ${skipped.length}개`);
  console.log(`실패: ${failed.length}개`);

  if (failed.length > 0) {
    for (const f of failed) {
      console.log(`  - ${f.key}: ${f.error}`);
    }
  }

  if (success.length > 0) {
    console.log("\n생성된 파일:");
    for (const s of success) {
      console.log(`  - content/posts/${s.filename}`);
    }
  }
};

// ─── 메인 ───────────────────────────────────────────────

const main = async (): Promise<void> => {
  const cliArgs = parseArgs();
  const index = loadArchiveIndex();

  if (index.entries.length === 0) {
    console.error(
      "오류: archive-index.json이 비어 있습니다.\n" +
        "먼저 인덱스를 생성하세요: npx tsx scripts/build-archive-index.ts"
    );
    process.exit(1);
  }

  // 처리할 엔트리 결정
  let targets: ArchiveIndexEntry[] = [];

  if (cliArgs.mode === "key") {
    const entry = index.entries.find((e) => e.key === cliArgs.key);
    if (!entry) {
      console.error(`오류: 인덱스에 없는 key입니다: ${cliArgs.key}`);
      process.exit(1);
    }
    if (entry.status === "done" || entry.status === "imported") {
      console.log(
        `[건너뜀] ${entry.key}: 이미 처리된 콘텐츠 (status: ${entry.status})`
      );
      return;
    }
    targets = [entry];
  } else {
    // --latest: backend/frontend를 번갈아 뽑아 주제 다양성 유지
    const pendingBe = index.entries.filter(
      (e) => e.status === "pending" && e.track === "backend"
    );
    const pendingFe = index.entries.filter(
      (e) => e.status === "pending" && e.track === "frontend"
    );

    const totalPending = pendingBe.length + pendingFe.length;
    if (totalPending === 0) {
      console.log("모든 아카이브 콘텐츠가 처리되었습니다. 새로 생성할 포스트가 없습니다.");
      await notifySlack(
        "📮 sunny-blog: 아카이브 콘텐츠가 모두 소진되었습니다. 자동 생성이 더 이상 새 포스트를 만들지 않습니다 — 새 콘텐츠 소스를 검토하세요."
      );
      return;
    }

    const count = Math.min(cliArgs.count ?? 1, totalPending);
    for (let i = 0; targets.length < count; i++) {
      const pick = i % 2 === 0 ? pendingBe.shift() ?? pendingFe.shift() : pendingFe.shift() ?? pendingBe.shift();
      if (!pick) break;
      targets.push(pick);
    }
    console.log(
      `[대상] pending ${totalPending}개 중 ${targets.length}개 처리: ${targets.map((t) => t.key).join(", ")}`
    );
  }

  // 순차 처리
  const existingSlugs = getExistingSlugs();
  const results: ProcessResult[] = [];

  for (const entry of targets) {
    try {
      const result = await processEntry(entry, existingSlugs);
      results.push(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[실패] ${entry.key}: ${message}`);
      updateEntryStatus(entry.key, "failed", { error: message });
      results.push({ key: entry.key, status: "failed", error: message });
    }

    if (entry !== targets[targets.length - 1]) {
      await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
    }
  }

  printReport(results);

  const failedCount = results.filter((r) => r.status === "failed").length;
  const successCount = results.filter((r) => r.status === "success").length;
  if (failedCount > 0) {
    await notifySlack(
      `⚠️ sunny-blog: 포스트 자동 생성 중 ${failedCount}건 실패 (성공 ${successCount}건). Actions 로그를 확인하세요.`
    );
    // 전부 실패했을 때만 에러 종료 — 부분 성공은 커밋되도록 정상 종료
    if (successCount === 0) {
      process.exit(1);
    }
  }
};

main();
