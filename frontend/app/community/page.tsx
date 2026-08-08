"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import api from "@/lib/axios";
import { Heart, MessageCircle, Share2, Trophy } from "lucide-react";

export default function CommunityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["community-feed"],
    queryFn: async () => {
      const { data } = await api.get("/community/feed");
      return data.data as any[];
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await api.get("/community/leaderboard");
      return data.data as any[];
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h1 className="font-poppins text-2xl font-bold mb-2">Cộng đồng VietEats</h1>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-64" />)
          : data?.map((post) => (
              <div key={post._id} className="card-md3 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Image src={post.user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=u"} alt="" width={40} height={40} className="rounded-full" />
                  <div>
                    <p className="font-semibold text-sm">{post.user?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
                <p className="text-sm mb-3">{post.content}</p>
                {post.images?.[0] && (
                  <div className="relative h-64 rounded-xl2 overflow-hidden mb-3">
                    <Image src={post.images[0]} alt="" fill className="object-cover" />
                  </div>
                )}
                <div className="flex gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1.5 hover:text-primary"><Heart className="w-4 h-4" /> {post.likes?.length || 0}</button>
                  <button className="flex items-center gap-1.5 hover:text-primary"><MessageCircle className="w-4 h-4" /> {post.comments?.length || 0}</button>
                  <button className="flex items-center gap-1.5 hover:text-primary"><Share2 className="w-4 h-4" /> {post.shareCount || 0}</button>
                </div>
              </div>
            ))}
      </div>

      <div>
        <div className="card-md3 p-4 sticky top-20">
          <h2 className="font-poppins font-bold flex items-center gap-2 mb-4"><Trophy className="w-5 h-5 text-accent" /> Bảng xếp hạng</h2>
          <div className="space-y-3">
            {leaderboard?.map((u, i) => (
              <div key={u._id} className="flex items-center gap-3">
                <span className="font-poppins font-bold text-sm w-5 text-center">{i + 1}</span>
                <Image src={u.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=u"} alt="" width={32} height={32} className="rounded-full" />
                <span className="flex-1 text-sm truncate">{u.name}</span>
                <span className="text-xs font-semibold text-primary">{u.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
