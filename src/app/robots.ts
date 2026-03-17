import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: "/api/",
  },
  sitemap: "https://deep-thought.space/sitemap.xml",
});

export default robots;
