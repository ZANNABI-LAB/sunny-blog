import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import matter from "gray-matter";
import { parseMaeilMailQuestion } from "./lib/maeil-mail-parser";
import { generatePost } from "./lib/post-generator";
import { upsertEmbedding } from "./lib/embedding-utils";

// ─── 타입 ───────────────────────────────────────────────

interface ProcessedIds {
  processedIds: number[];
  lastUpdated: string;
}

interface ProcessResult {
  id: number;
  status: "success" | "skipped" | "failed";
  filename?: string;
  error?: string;
}

// ─── 상수 ───────────────────────────────────────────────

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const DATA_DIR = path.join(process.cwd(), "scripts", "data");
const PROCESSED_IDS_PATH = path.join(DATA_DIR, "processed-ids.json");
const LATEST_MAX_CONSECUTIVE_NULLS = 20;
const LATEST_SCAN_UPPER_BOUND = 100; // maxId + 100까지만 스캔

// ─── 처리 이력 관리 ─────────────────────────────────────

const loadProcessedIds = (): ProcessedIds => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(PROCESSED_IDS_PATH)) {
    const initial: ProcessedIds = {
      processedIds: [],
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(PROCESSED_IDS_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }

  const raw = fs.readFileSync(PROCESSED_IDS_PATH, "utf-8");
  return JSON.parse(raw) as ProcessedIds;
};

const saveProcessedId = (id: number): void => {
  const data = loadProcessedIds();

  if (!data.processedIds.includes(id)) {
    data.processedIds.push(id);
    data.processedIds.sort((a, b) => a - b);
  }

  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PROCESSED_IDS_PATH, JSON.stringify(data, null, 2));
};

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

// ─── 단일 질문 처리 ─────────────────────────────────────

const processQuestion = async (
  id: number,
  existingSlugs: string[]
): Promise<ProcessResult> => {
  // 1. 처리 이력 확인
  const { processedIds } = loadProcessedIds();
  if (processedIds.includes(id)) {
    console.log(`[건너뜀] ID ${id}: 이미 처리된 질문`);
    return { id, status: "skipped" };
  }

  // 2. 매일메일 질문 파싱
  console.log(`[파싱] ID ${id} 스크래핑 중...`);
  const question = await parseMaeilMailQuestion(id);
  if (!question) {
    return { id, status: "failed", error: "매일메일 파싱 실패 (null 반환)" };
  }
  console.log(`  질문: ${question.question.slice(0, 50)}...`);

  // 3. Claude로 포스트 생성
  console.log(`[생성] Claude API 호출 중...`);
  const post = await generatePost(question, { existingSlugs });
  console.log(`  slug: ${post.slug}`);

  // 4. 파일 저장
  const filePath = path.join(POSTS_DIR, post.filename);
  fs.writeFileSync(filePath, post.content, "utf-8");
  console.log(`  [저장] ${filePath}`);

  // 5. existingSlugs에 추가 (후속 처리에서 중복 방지)
  existingSlugs.push(post.slug);

  // 6. 임베딩 생성 (실패해도 포스트 파일은 유지)
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

  // 7. 처리 이력 기록
  saveProcessedId(id);

  return { id, status: "success", filename: post.filename };
};

// ─── CLI 인자 파싱 ──────────────────────────────────────

interface CliArgs {
  mode: "single" | "range" | "latest";
  id?: number;
  from?: number;
  to?: number;
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
    const count = countStr ? parseInt(countStr, 10) : undefined;
    if (countStr && (isNaN(count!) || count! <= 0)) {
      console.error("오류: --count 값이 유효한 양의 정수가 아닙니다.");
      process.exit(1);
    }
    return { mode: "latest", count };
  }

  const idStr = getArgValue("--id");
  if (idStr) {
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      console.error("오류: --id 값이 유효한 숫자가 아닙니다.");
      process.exit(1);
    }
    return { mode: "single", id };
  }

  const fromStr = getArgValue("--from");
  const toStr = getArgValue("--to");
  if (fromStr && toStr) {
    const from = parseInt(fromStr, 10);
    const to = parseInt(toStr, 10);
    if (isNaN(from) || isNaN(to)) {
      console.error("오류: --from / --to 값이 유효한 숫자가 아닙니다.");
      process.exit(1);
    }
    if (from > to) {
      console.error("오류: --from 값이 --to 값보다 클 수 없습니다.");
      process.exit(1);
    }
    return { mode: "range", from, to };
  }

  console.error(`사용법:
  npm run generate-post -- --id <number>           # 단일 질문
  npm run generate-post -- --from <n> --to <n>     # 범위 처리
  npm run generate-post -- --latest                # 미처리 최신 질문
  npm run generate-post -- --latest --count <n>    # 미처리 최신 질문 (최대 N개)`);
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
  console.log(`건너뜀 (이미 처리): ${skipped.length}개`);
  console.log(`실패: ${failed.length}개`);

  if (failed.length > 0) {
    for (const f of failed) {
      console.log(`  - ID ${f.id}: ${f.error}`);
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
  const existingSlugs = getExistingSlugs();
  const results: ProcessResult[] = [];

  // 처리할 ID 목록 결정
  let ids: number[] = [];

  switch (cliArgs.mode) {
    case "single":
      ids = [cliArgs.id!];
      break;

    case "range":
      for (let i = cliArgs.from!; i <= cliArgs.to!; i++) {
        ids.push(i);
      }
      break;

    case "latest": {
      const { processedIds } = loadProcessedIds();
      if (processedIds.length === 0) {
        console.error(
          "오류: processed-ids.json에 처리 이력이 없습니다.\n" +
            "첫 실행 시에는 --id 또는 --from/--to를 사용하세요.\n" +
            "예: npm run generate-post -- --id 1"
        );
        process.exit(1);
      }

      const maxId = Math.max(...processedIds);
      const scanLimit = maxId + LATEST_SCAN_UPPER_BOUND;
      let consecutiveNulls = 0;
      let currentId = maxId + 1;

      console.log(
        `[최신] 마지막 처리 ID: ${maxId}, ID ${currentId}부터 탐색 시작... (상한: ${scanLimit})`
      );

      while (
        consecutiveNulls < LATEST_MAX_CONSECUTIVE_NULLS &&
        currentId <= scanLimit &&
        (!cliArgs.count || ids.length < cliArgs.count)
      ) {
        const question = await parseMaeilMailQuestion(currentId);
        if (question) {
          ids.push(currentId);
          consecutiveNulls = 0;
        } else {
          consecutiveNulls++;
          console.log(
            `  [탐색] ID ${currentId}: 없음 (연속 ${consecutiveNulls}/${LATEST_MAX_CONSECUTIVE_NULLS})`
          );
        }
        currentId++;
      }

      if (ids.length === 0) {
        console.log("새로운 질문을 찾지 못했습니다.");
        return;
      }

      console.log(`[최신] 발견된 새 질문: ${ids.length}개\n`);
      break;
    }
  }

  // 순차 처리
  for (const id of ids) {
    try {
      const result = await processQuestion(id, existingSlugs);
      results.push(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[실패] ID ${id}: ${message}`);
      results.push({ id, status: "failed", error: message });
    }

    // 연속 요청 간 딜레이 (마지막이 아닌 경우)
    if (id !== ids[ids.length - 1]) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // 리포트 출력
  printReport(results);

  // 실패가 있으면 exit(1)
  const hasFailures = results.some((r) => r.status === "failed");
  if (hasFailures) {
    process.exit(1);
  }
};

main();
