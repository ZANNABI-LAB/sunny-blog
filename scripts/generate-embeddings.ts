import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
import matter from "gray-matter";
import {
  upsertEmbedding,
  type EmbeddingInput,
} from "./lib/embedding-utils";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const readAllPosts = (): EmbeddingInput[] => {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));

  return files.map((file) => {
    const slug = path.basename(file, ".md");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf-8");
    const { data, content } = matter(raw);

    return {
      slug,
      title: (data.title as string) ?? "Untitled",
      summary: (data.summary as string) ?? "",
      content,
    };
  });
};

const main = async () => {
  console.log("=== 임베딩 생성 스크립트 시작 ===\n");

  const posts = readAllPosts();
  console.log(`발견된 포스트: ${posts.length}개\n`);

  if (posts.length === 0) {
    console.log("처리할 포스트가 없습니다.");
    return;
  }

  let successCount = 0;
  let failCount = 0;

  for (const post of posts) {
    try {
      console.log(`[처리 중] ${post.slug} - ${post.title}`);

      await upsertEmbedding(post);

      console.log(`  [성공] ${post.slug}`);
      successCount++;
      // Voyage AI rate limit 대응: 포스트 간 2초 대기
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  [실패] ${post.slug}: ${message}`);
      failCount++;
      // rate limit 시 10초 대기 후 재시도
      if (message.includes("429")) {
        console.log(`  [대기] rate limit — 10초 대기 후 재시도...`);
        await new Promise((r) => setTimeout(r, 10000));
        try {
          await upsertEmbedding(post);
          console.log(`  [재시도 성공] ${post.slug}`);
          successCount++;
          failCount--;
          await new Promise((r) => setTimeout(r, 2000));
        } catch { /* 재시도도 실패하면 무시 */ }
      }
    }
  }

  console.log(`\n=== 완료 ===`);
  console.log(`성공: ${successCount}개 / 실패: ${failCount}개`);

  if (failCount > 0) {
    process.exit(1);
  }
};

main();
