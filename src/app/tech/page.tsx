import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/post-card";

const TechPage = () => {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Tech</h1>
      <p className="mt-2 text-zinc-400">
        기술 학습 기록과 개발 경험을 공유합니다.
      </p>

      {posts.length > 0 ? (
        <section className="mt-8 flex flex-col gap-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </section>
      ) : (
        <p className="py-16 text-center text-zinc-400">
          아직 작성된 포스트가 없습니다.
        </p>
      )}
    </div>
  );
};

export default TechPage;
