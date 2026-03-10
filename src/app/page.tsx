import { getAllPosts } from "@/lib/posts";
import { buildGraphData } from "@/lib/graph";
import MainHero from "@/components/main-hero";

const MainPage = () => {
  const posts = getAllPosts();
  const graphData = buildGraphData(posts);

  return (
    <div className="h-full">
      <MainHero graphData={graphData} />
    </div>
  );
};

export default MainPage;
