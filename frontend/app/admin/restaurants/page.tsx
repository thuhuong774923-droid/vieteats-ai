"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Search, ShieldCheck, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminRestaurantsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-restaurants", q, page],
    queryFn: async () => {
      const { data } = await api.get("/restaurants", { params: { q, page, limit: 20 } });
      return data as { data: any[]; pagination: { total: number; pages: number } };
    },
  });

  const toggleVerify = async (id: string, current: boolean) => {
    await api.put(`/admin/restaurants/${id}`, { isVerified: !current }).catch(() => {});
    queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-poppins text-2xl font-bold">🏮 Quản lý nhà hàng</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder="Tìm quán ăn..."
              className="pl-9 pr-3 py-2 rounded-xl2 border border-black/10 text-sm"
            />
          </div>
        </div>

        <div className="card-md3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-black/5 text-gray-500">
                <th className="p-3">Tên quán</th>
                <th className="p-3">Địa chỉ</th>
                <th className="p-3">Tỉnh</th>
                <th className="p-3">Giá</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Xác thực</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400">Đang tải...</td></tr>
              ) : data?.data.map((r) => (
                <tr key={r._id} className="border-b border-black/5 hover:bg-primary/5">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3 flex items-center gap-1 text-gray-500"><MapPin className="w-3.5 h-3.5" /> {r.address}</td>
                  <td className="p-3">{r.province?.name}</td>
                  <td className="p-3">{r.priceRange}</td>
                  <td className="p-3 flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-accent text-accent" /> {r.rating?.toFixed(1)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleVerify(r._id, r.isVerified)}
                      className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${r.isVerified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> {r.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-full border border-black/10 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm">Trang {page} / {data.pagination.pages}</span>
            <button disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-full border border-black/10 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
