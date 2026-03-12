"use client";

import { useEffect, useState } from "react";
import type { PostMeta } from "@/types/post";
import PostCard from "@/components/post-card";

type PostListWithViewsProps = {
  posts: PostMeta[];
};

const PostListWithViews = ({ posts }: PostListWithViewsProps) => {
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (posts.length === 0) return;

    const fetchViewCounts = async () => {
      try {
        const slugs = posts.map((p) => `tech/${p.slug}`).join(",");
        const res = await fetch(
          `/api/views?slugs=${encodeURIComponent(slugs)}`
        );
        const data = await res.json();
        setViewCounts(data.views ?? {});
      } catch (err) {
        console.error("PostListWithViews error:", err);
      }
    };

    fetchViewCounts();
  }, [posts]);

  return (
    <section className="mt-10 bento-grid">
      {posts.map((post, i) => (
        <PostCard
          key={post.slug}
          post={post}
          featured={i === 0}
          index={i}
          viewCount={viewCounts[`tech/${post.slug}`]}
        />
      ))}
    </section>
  );
};

export default PostListWithViews;
