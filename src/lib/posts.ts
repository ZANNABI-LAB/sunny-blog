import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { processMarkdown } from "@/lib/markdown";
import type { PostMeta, Post, PostSeries } from "@/types/post";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const slugFromFilePath = (filePath: string): string => {
  return path.basename(filePath, ".md");
};

const parseSeries = (data: Record<string, unknown>): PostSeries | null => {
  const series = data.series as Partial<PostSeries> | undefined;
  if (
    !series ||
    typeof series.id !== "string" ||
    typeof series.title !== "string" ||
    typeof series.order !== "number"
  ) {
    return null;
  }
  return { id: series.id, title: series.title, order: series.order };
};

const readMarkdownFiles = (): string[] => {
  const files = fs.readdirSync(POSTS_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(POSTS_DIR, file));
};

export const getAllPosts = (): PostMeta[] => {
  const filePaths = readMarkdownFiles();

  const posts = filePaths.map((filePath): PostMeta => {
    const slug = slugFromFilePath(filePath);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: (data.title as string) ?? "Untitled",
      date: (data.date as string) ?? "1970-01-01",
      tags: (data.tags as string[]) ?? [],
      category: (data.category as string) ?? "uncategorized",
      summary: (data.summary as string) ?? "",
      author: (data.author as string) ?? "신중선",
      references: (data.references as string[]) ?? [],
      ...(data.shortTitle ? { shortTitle: data.shortTitle as string } : {}),
      ...(data.source ? { source: data.source as string } : {}),
      ...(data.sourceUrl ? { sourceUrl: data.sourceUrl as string } : {}),
      ...(parseSeries(data) ? { series: parseSeries(data)! } : {}),
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
};

/**
 * 특정 시리즈에 속한 포스트를 order 오름차순으로 반환한다.
 */
export const getSeriesPosts = (seriesId: string): PostMeta[] => {
  return getAllPosts()
    .filter((post) => post.series?.id === seriesId)
    .sort((a, b) => (a.series!.order < b.series!.order ? -1 : 1));
};

export const getPostSlugs = (): string[] => {
  return readMarkdownFiles().map(slugFromFilePath);
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isValidSlug = (slug: string): boolean => SLUG_PATTERN.test(slug);

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  if (!isValidSlug(slug)) {
    return null;
  }

  const filePath = path.join(POSTS_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContents);

  const contentHtml = await processMarkdown(content);

  return {
    slug,
    title: (data.title as string) ?? "Untitled",
    date: (data.date as string) ?? "1970-01-01",
    tags: (data.tags as string[]) ?? [],
    category: (data.category as string) ?? "uncategorized",
    summary: (data.summary as string) ?? "",
    author: (data.author as string) ?? "신중선",
    references: (data.references as string[]) ?? [],
    ...(data.shortTitle ? { shortTitle: data.shortTitle as string } : {}),
    ...(data.source ? { source: data.source as string } : {}),
    ...(data.sourceUrl ? { sourceUrl: data.sourceUrl as string } : {}),
    ...(parseSeries(data) ? { series: parseSeries(data)! } : {}),
    contentHtml,
  };
};
