import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllLogs } from "@/lib/logs";

const BASE_URL = "https://deep-thought.space";

const sitemap = (): MetadataRoute.Sitemap => {
  const posts = getAllPosts();
  const logs = getAllLogs();

  const latestPostDate =
    posts.length > 0 ? new Date(posts[0].date) : new Date("2025-01-01");
  const latestLogDate =
    logs.length > 0 ? new Date(logs[0].date) : new Date("2025-01-01");
  const latestContentDate =
    latestPostDate > latestLogDate ? latestPostDate : latestLogDate;

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: latestContentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tech`,
      lastModified: latestPostDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/profile`,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/portfolio`,
      lastModified: new Date("2025-01-01"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/log`,
      lastModified: latestLogDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/tech/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const logPages: MetadataRoute.Sitemap = logs.map((log) => ({
    url: `${BASE_URL}/log/${log.slug}`,
    lastModified: new Date(log.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...logPages];
};

export default sitemap;
