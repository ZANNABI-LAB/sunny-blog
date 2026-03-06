import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });
import matter from "gray-matter";
import { createSupabaseClient } from "../src/lib/supabase";
import { generateEmbedding } from "../src/lib/embedding";

interface PostData {
  slug: string;
  title: string;
  summary: string;
  content: string;
}

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const readAllPosts = (): PostData[] => {
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

const buildEmbeddingText = (post: PostData): string => {
  return [post.title, post.summary, post.content].join("\n\n");
};

const main = async () => {
  console.log("=== 임베딩 생성 스크립트 시작 ===\n");

  const posts = readAllPosts();
  console.log(`발견된 포스트: ${posts.length}개\n`);

  if (posts.length === 0) {
    console.log("처리할 포스트가 없습니다.");
    return;
  }

  const supabase = createSupabaseClient();
  let successCount = 0;
  let failCount = 0;

  for (const post of posts) {
    try {
      console.log(`[처리 중] ${post.slug} - ${post.title}`);

      const text = buildEmbeddingText(post);
      const embedding = await generateEmbedding(text);

      const { error } = await supabase.from("post_embeddings").upsert(
        {
          slug: post.slug,
          title: post.title,
          content: text,
          embedding: JSON.stringify(embedding),
        },
        { onConflict: "slug" }
      );

      if (error) {
        throw new Error(`Supabase upsert 실패: ${error.message}`);
      }

      console.log(`  [성공] ${post.slug}`);
      successCount++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  [실패] ${post.slug}: ${message}`);
      failCount++;
    }
  }

  console.log(`\n=== 완료 ===`);
  console.log(`성공: ${successCount}개 / 실패: ${failCount}개`);

  if (failCount > 0) {
    process.exit(1);
  }
};

main();
