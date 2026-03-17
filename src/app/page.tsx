import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { buildGraphData } from "@/lib/graph";
import MainHero from "@/components/main-hero";

export const metadata: Metadata = {
  title: "Deep Thought — 개발 블로그",
  description:
    "The answer to the ultimate question of life, the universe, and code. 백엔드·프론트엔드·AI 기술 블로그",
  alternates: { canonical: "/" },
};

const MainPage = () => {
  const posts = getAllPosts();
  const graphData = buildGraphData(posts);

  return <MainHero graphData={graphData} />;
};

export default MainPage;
