"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Sparkles } from "lucide-react";

export default function AdminAiLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-ai-logs"],
    queryFn: async () => {
      const { data } = await api.get("/admin/ai-logs", { params: { limit: 20 } });
      return data.data as any[];
    },
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-poppins text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Nhật ký AI Assistant
        </h1>

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-gray-400 text-sm">Đang tải...</p>
          ) : data?.length === 0 ? (
            <div className="card-md3 p-8 text-center text-gray-400 text-sm">Chưa có cuộc trò chuyện nào.</div>
          ) : data?.map((chat) => (
            <div key={chat._id} className="card-md3 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Image src={chat.user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=u"} alt="" width={28} height={28} className="rounded-full" />
                <span className="text-sm font-medium">{chat.user?.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{chat.model}</span>
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {chat.messages?.slice(-4).map((m: any, i: number) => (
                  <p key={i} className={`text-xs ${m.role === "user" ? "text-textmain dark:text-textmain-dark" : "text-primary"}`}>
                    <strong>{m.role === "user" ? "User: " : "AI: "}</strong>{m.content}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
