"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Trash2, Heart, MessageCircle } from "lucide-react";

export default function AdminCommunityPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-community"],
    queryFn: async () => {
      const { data } = await api.get("/admin/community", { params: { limit: 30 } });
      return data.data as any[];
    },
  });

  const remove = async (id: string) => {
    if (!confirm("Xoá bài đăng này?")) return;
    await api.delete(`/admin/community/${id}`);
    queryClient.invalidateQueries({ queryKey: ["admin-community"] });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-poppins text-2xl font-bold mb-6">💬 Quản lý cộng đồng</h1>

        <div className="grid md:grid-cols-2 gap-4">
          {isLoading ? (
            <p className="text-gray-400 text-sm">Đang tải...</p>
          ) : data?.map((post) => (
            <div key={post._id} className="card-md3 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Image src={post.user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=u"} alt="" width={28} height={28} className="rounded-full" />
                  <span className="text-sm font-medium">{post.user?.name}</span>
                </div>
                <button onClick={() => remove(post._id)} className="p-1.5 rounded-full hover:bg-primary hover:text-white text-primary">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{post.content}</p>
              <div className="flex gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes?.length || 0}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
