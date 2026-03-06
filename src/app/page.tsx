import { getAllPosts } from "@/lib/posts";
import { buildGraphData } from "@/lib/graph";
import GraphView from "@/components/graph-view";

const MainPage = () => {
  const posts = getAllPosts();
  const graphData = buildGraphData(posts);

  return (
    <div>
      <GraphView data={graphData} />
    </div>
  );
};

export default MainPage;
