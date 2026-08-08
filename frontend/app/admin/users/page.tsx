"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Search, ShieldCheck, Ban } from "lucide-react";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: async () => {
      const { data } = await api.get("/admin/users", { params: { q, limit: 30 } });
      return data.data as any[];
    },
  });

  const toggleActive = async (id: string) => {
    await api.patch(`/admin/users/${id}/toggle-active`);
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-poppins text-2xl font-bold">👥 Quản lý người dùng</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên/email..." className="pl-9 pr-3 py-2 rounded-xl2 border border-black/10 text-sm" />
          </div>
        </div>

        <div className="card-md3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-black/5 text-gray-500">
                <th className="p-3">Tên</th>
                <th className="p-3">Email</th>
                <th className="p-3">Vai trò</th>
                <th className="p-3">Điểm</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400">Đang tải...</td></tr>
              ) : data?.map((u) => (
                <tr key={u._id} className="border-b border-black/5 hover:bg-primary/5">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">{u.points}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.isActive ? "Hoạt động" : "Đã khoá"}
                    </span>
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleActive(u._id)} className="p-1.5 rounded-full hover:bg-primary hover:text-white text-primary" title="Khoá/Mở khoá">
                      {u.isActive ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
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
