import { getAllPosts } from "@/lib/posts";
import { buildGraphData } from "@/lib/graph";
import MainHero from "@/components/main-hero";

const MainPage = () => {
  const posts = getAllPosts();
  const graphData = buildGraphData(posts);

  return (
    <div className="-mx-4 -mt-8 -mb-[104px]">
      <MainHero graphData={graphData} />
    </div>
  );
};

export default MainPage;
