"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Flag, Check, Trash2 } from "lucide-react";

export default function AdminReportsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: async () => {
      const { data } = await api.get("/admin/reports");
      return data.data as any[];
    },
  });

  const resolve = async (id: string, action: "dismiss" | "delete") => {
    await api.post(`/admin/reports/${id}/resolve`, { action });
    queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-poppins text-2xl font-bold mb-6 flex items-center gap-2">
          <Flag className="w-5 h-5 text-primary" /> Báo cáo vi phạm
        </h1>

        <div className="space-y-3">
          {isLoading ? (
            <p className="text-gray-400 text-sm">Đang tải...</p>
          ) : data?.length === 0 ? (
            <div className="card-md3 p-8 text-center text-gray-400 text-sm">🎉 Không có báo cáo nào cần xử lý.</div>
          ) : data?.map((r) => (
            <div key={r._id} className="card-md3 p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{r.user?.name}</p>
                <p className="text-sm text-gray-500">{r.comment}</p>
                <p className="text-[10px] text-gray-400 mt-1">Loại: {r.targetType}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => resolve(r._id, "dismiss")} className="p-1.5 rounded-full bg-green-100 text-green-700" title="Bỏ qua báo cáo">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => resolve(r._id, "delete")} className="p-1.5 rounded-full bg-red-100 text-red-700" title="Xoá nội dung">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
