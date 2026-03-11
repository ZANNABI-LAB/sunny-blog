import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { processMarkdown } from "@/lib/markdown";
import type { LogMeta, Log } from "@/types/log";

const LOGS_DIR = path.join(process.cwd(), "content", "logs");

const slugFromFilePath = (filePath: string): string => {
  return path.basename(filePath, ".md");
};

const readMarkdownFiles = (): string[] => {
  if (!fs.existsSync(LOGS_DIR)) return [];
  const files = fs.readdirSync(LOGS_DIR);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => path.join(LOGS_DIR, file));
};

export const getAllLogs = (): LogMeta[] => {
  const filePaths = readMarkdownFiles();

  const logs = filePaths.map((filePath): LogMeta => {
    const slug = slugFromFilePath(filePath);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: (data.title as string) ?? "Untitled",
      date: (data.date as string) ?? "1970-01-01",
      tags: (data.tags as string[]) ?? [],
      summary: (data.summary as string) ?? "",
    };
  });

  return logs.sort((a, b) => (a.date < b.date ? 1 : -1));
};

export const getLogSlugs = (): string[] => {
  return readMarkdownFiles().map(slugFromFilePath);
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const getLogBySlug = async (slug: string): Promise<Log | null> => {
  if (!SLUG_PATTERN.test(slug)) return null;

  const filePath = path.join(LOGS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContents);

  const contentHtml = await processMarkdown(content);

  return {
    slug,
    title: (data.title as string) ?? "Untitled",
    date: (data.date as string) ?? "1970-01-01",
    tags: (data.tags as string[]) ?? [],
    summary: (data.summary as string) ?? "",
    contentHtml,
  };
};
