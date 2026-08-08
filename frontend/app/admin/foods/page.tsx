"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Trash2, Search } from "lucide-react";

export default function AdminFoodsPage() {
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-foods", q],
    queryFn: async () => {
      const { data } = await api.get("/foods", { params: { q, limit: 30 } });
      return data.data as any[];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá món ăn này?")) return;
    await api.delete(`/admin/foods/${id}`);
    queryClient.invalidateQueries({ queryKey: ["admin-foods"] });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-poppins text-2xl font-bold">🍜 Quản lý món ăn</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm món ăn..." className="pl-9 pr-3 py-2 rounded-xl2 border border-black/10 text-sm" />
          </div>
        </div>

        <div className="card-md3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-black/5 text-gray-500">
                <th className="p-3">Tên món</th>
                <th className="p-3">Vùng miền</th>
                <th className="p-3">Giá</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Lượt xem</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400">Đang tải...</td></tr>
              ) : data?.map((f) => (
                <tr key={f._id} className="border-b border-black/5 hover:bg-primary/5">
                  <td className="p-3 font-medium">{f.name}</td>
                  <td className="p-3">{f.region}</td>
                  <td className="p-3">{f.priceMin?.toLocaleString()}đ</td>
                  <td className="p-3">★ {f.rating?.toFixed(1)}</td>
                  <td className="p-3">{f.viewCount}</td>
                  <td className="p-3">
                    <button onClick={() => handleDelete(f._id)} className="p-1.5 rounded-full hover:bg-primary hover:text-white text-primary">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
