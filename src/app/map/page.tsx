import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { buildGraphData } from "@/lib/graph";
import MainHero from "@/components/main-hero";

export const metadata: Metadata = {
  title: "Board Map",
  description: "글과 분야의 연결을 회로기판으로 훑어보는 지도",
  alternates: { canonical: "/map" },
};

const MapPage = () => {
  const graphData = buildGraphData(getAllPosts());

  return <MainHero graphData={graphData} />;
};

export default MapPage;
