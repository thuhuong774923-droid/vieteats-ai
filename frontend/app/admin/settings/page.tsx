"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Save, Globe, Bell, Shield, Sparkles, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await api.get("/admin/settings");
      return data.data;
    },
  });

  const [form, setForm] = useState({
    siteName: "VietEats AI",
    maintenanceMode: false,
    aiModel: "gpt-4o-mini",
    pushNotificationsEnabled: true,
    contactEmail: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        siteName: data.siteName,
        maintenanceMode: data.maintenanceMode,
        aiModel: data.aiModel,
        pushNotificationsEnabled: data.pushNotificationsEnabled,
        contactEmail: data.contactEmail,
      });
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", form);
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="flex min-h-screen"><AdminSidebar /><main className="flex-1 p-8"><div className="skeleton h-96" /></main></div>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 max-w-2xl">
        <h1 className="font-poppins text-2xl font-bold mb-6">⚙️ Cài đặt hệ thống</h1>
        <p className="text-xs text-gray-400 mb-4">Cấu hình được lưu bền vững vào MongoDB (collection Settings), áp dụng cho toàn hệ thống.</p>

        <div className="card-md3 p-5 mb-4">
          <h2 className="font-poppins font-semibold mb-4 flex items-center gap-2"><Globe className="w-4 h-4" /> Thông tin chung</h2>
          <label className="text-xs text-gray-500">Tên website</label>
          <input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} className="w-full mt-1 mb-3 px-3 py-2 rounded-xl2 border border-black/10 text-sm" />
          <label className="text-xs text-gray-500">Email liên hệ</label>
          <input value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl2 border border-black/10 text-sm" />
        </div>

        <div className="card-md3 p-5 mb-4">
          <h2 className="font-poppins font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4" /> Bảo trì</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm">Chế độ bảo trì (tắt truy cập công khai)</span>
            <button onClick={() => setForm({ ...form, maintenanceMode: !form.maintenanceMode })} className={`w-11 h-6 rounded-full transition-colors relative ${form.maintenanceMode ? "bg-primary" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.maintenanceMode ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="card-md3 p-5 mb-4">
          <h2 className="font-poppins font-semibold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> AI Assistant</h2>
          <label className="text-xs text-gray-500">Model mặc định</label>
          <select value={form.aiModel} onChange={(e) => setForm({ ...form, aiModel: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl2 border border-black/10 text-sm">
            <option value="gpt-4o-mini">OpenAI GPT-4o-mini</option>
            <option value="gemini-1.5-flash">Google Gemini 1.5 Flash</option>
          </select>
          <p className="text-[11px] text-gray-400 mt-2">API key được cấu hình qua biến môi trường backend (.env), không lưu ở đây vì lý do bảo mật.</p>
        </div>

        <div className="card-md3 p-5 mb-6">
          <h2 className="font-poppins font-semibold mb-4 flex items-center gap-2"><Bell className="w-4 h-4" /> Thông báo hệ thống</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm">Gửi thông báo qua Firebase Push</span>
            <button onClick={() => setForm({ ...form, pushNotificationsEnabled: !form.pushNotificationsEnabled })} className={`w-11 h-6 rounded-full transition-colors relative ${form.pushNotificationsEnabled ? "bg-primary" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.pushNotificationsEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {saved ? "Đã lưu!" : "Lưu cài đặt"}
        </button>
      </main>
    </div>
  );
}
