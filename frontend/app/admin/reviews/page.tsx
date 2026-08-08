"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Star, Trash2, Flag } from "lucide-react";

export default function AdminReviewsPage() {
  const [reportedOnly, setReportedOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews", reportedOnly],
    queryFn: async () => {
      const { data } = await api.get("/admin/reviews", { params: { reportedOnly, limit: 30 } });
      return data.data as any[];
    },
  });

  const remove = async (id: string) => {
    if (!confirm("Xoá đánh giá này?")) return;
    await api.delete(`/admin/reviews/${id}`);
    queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-poppins text-2xl font-bold">⭐ Quản lý đánh giá</h1>
          <button
            onClick={() => setReportedOnly((v) => !v)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${reportedOnly ? "bg-primary text-white" : "border border-black/10"}`}
          >
            <Flag className="w-3.5 h-3.5" /> Chỉ hiện bị báo cáo
          </button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-gray-400 text-sm">Đang tải...</p>
          ) : data?.length === 0 ? (
            <div className="card-md3 p-8 text-center text-gray-400 text-sm">Không có đánh giá nào.</div>
          ) : data?.map((r) => (
            <div key={r._id} className="card-md3 p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{r.user?.name}</span>
                  <span className="flex items-center gap-0.5 text-accent text-xs">
                    {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-accent" />)}
                  </span>
                  <span className="text-[10px] text-gray-400">{r.targetType}</span>
                  {r.isReported && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Bị báo cáo</span>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
              </div>
              <button onClick={() => remove(r._id)} className="p-1.5 rounded-full hover:bg-primary hover:text-white text-primary shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
