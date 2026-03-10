import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { getAllLogs } from "@/lib/logs";

const BASE_URL = "https://deep-thought.space";

const sitemap = (): MetadataRoute.Sitemap => {
  const posts = getAllPosts();
  const logs = getAllLogs();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tech`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/profile`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/log`,
      lastModified: new Date(),
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
