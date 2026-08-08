"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Search, Pencil, X, Check } from "lucide-react";

export default function AdminLocationsPage() {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ description: "", cuisine: "" });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: async () => {
      const { data } = await api.get("/admin/locations");
      return data.data as any[];
    },
  });

  const filtered = data?.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const startEdit = (province: any) => {
    setEditing(province._id);
    setForm({ description: province.description || "", cuisine: province.cuisine || "" });
  };

  const save = async (id: string) => {
    await api.put(`/admin/locations/${id}`, form);
    queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
    setEditing(null);
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-poppins text-2xl font-bold">🗺️ Quản lý 63 tỉnh thành</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tỉnh thành..." className="pl-9 pr-3 py-2 rounded-xl2 border border-black/10 text-sm" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {isLoading ? (
            <p className="text-gray-400 text-sm">Đang tải...</p>
          ) : filtered?.map((p) => (
            <div key={p._id} className="card-md3 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">Miền {p.region}</p>
                </div>
                {editing === p._id ? (
                  <div className="flex gap-1">
                    <button onClick={() => save(p._id)} className="p-1.5 rounded-full bg-primary text-white"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditing(null)} className="p-1.5 rounded-full border border-black/10"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(p)} className="p-1.5 rounded-full hover:bg-primary hover:text-white text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                )}
              </div>
              {editing === p._id ? (
                <div className="space-y-2">
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full text-xs p-2 rounded-xl2 border border-black/10" rows={2} placeholder="Mô tả" />
                  <textarea value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} className="w-full text-xs p-2 rounded-xl2 border border-black/10" rows={2} placeholder="Ẩm thực" />
                </div>
              ) : (
                <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
