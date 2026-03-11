import { getAllPosts } from "@/lib/posts";
import { getAllLogs } from "@/lib/logs";

const BASE_URL = "https://deep-thought.space";

const escapeXml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const GET = () => {
  const posts = getAllPosts();
  const logs = getAllLogs();

  const allItems = [
    ...posts.map((post) => ({
      title: post.title,
      url: `${BASE_URL}/tech/${post.slug}`,
      date: post.date,
      summary: post.summary,
      category: post.category,
    })),
    ...logs.map((log) => ({
      title: log.title,
      url: `${BASE_URL}/log/${log.slug}`,
      date: log.date,
      summary: log.summary,
      category: "log",
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const latestDate = allItems[0]?.date
    ? new Date(allItems[0].date).toUTCString()
    : new Date().toUTCString();

  const items = allItems
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.url}</link>
      <guid>${item.url}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${escapeXml(item.summary)}</description>
      <category>${escapeXml(item.category)}</category>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Deep Thought</title>
    <link>${BASE_URL}</link>
    <description>The answer to the ultimate question of life, the universe, and code.</description>
    <language>ko</language>
    <lastBuildDate>${latestDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
};
