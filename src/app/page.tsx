import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { getCategoryRoot } from "@/lib/categories";
import MissionControl from "@/components/mission-control";

export const metadata: Metadata = {
  title: "Deep Thought — 개발 블로그",
  description:
    "The answer to the ultimate question of life, the universe, and code. 백엔드·프론트엔드·AI 기술 블로그",
  alternates: { canonical: "/" },
};

const MainPage = () => {
  const posts = getAllPosts();

  const counts = posts.reduce<Record<string, number>>((acc, post) => {
    const root = getCategoryRoot(post.category);
    acc[root] = (acc[root] ?? 0) + 1;
    return acc;
  }, {});

  const breakdown = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <MissionControl
      total={posts.length}
      breakdown={breakdown}
      latest={posts.slice(0, 3)}
    />
  );
};

export default MainPage;
