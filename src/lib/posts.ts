import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { processMarkdown } from "@/lib/markdown";
import type { PostMeta, Post } from "@/types/post";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

const slugFromFilePath = (filePath: string): string => {
  return path.basename(filePath, ".md");
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
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
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
    contentHtml,
  };
};
