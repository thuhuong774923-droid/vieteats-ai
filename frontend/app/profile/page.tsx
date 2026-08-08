"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import api from "@/lib/axios";
import { Settings, Moon, Bell, LogOut, Award } from "lucide-react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/store";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.data;
    },
    retry: false,
  });

  const { data: passport } = useQuery({
    queryKey: ["my-passport-mini"],
    queryFn: async () => {
      const { data } = await api.get("/passport/me");
      return data.data;
    },
    enabled: !!user,
  });

  const handleLogout = () => {
    localStorage.removeItem("vieteats_token");
    dispatch(logout());
    router.push("/login");
  };

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-10"><div className="skeleton h-60" /></div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="mb-4 text-gray-500">Bạn cần đăng nhập để xem hồ sơ.</p>
        <a href="/login" className="btn-primary">Đăng nhập ngay</a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <div className="card-md3 p-6 flex items-center gap-4">
        <Image src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=me"} alt={user.name} width={72} height={72} className="rounded-full border-4 border-primary/20" />
        <div className="flex-1">
          <h1 className="font-poppins text-xl font-bold">{user.name}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>{user.followers?.length || 0} người theo dõi</span>
            <span>{user.following?.length || 0} đang theo dõi</span>
            <span className="flex items-center gap-1 text-primary font-semibold"><Award className="w-3.5 h-3.5" /> {passport?.points || 0} điểm</span>
          </div>
        </div>
      </div>

      <div className="card-md3 p-5 mt-6">
        <h2 className="font-poppins font-semibold mb-4 flex items-center gap-2"><Settings className="w-4 h-4" /> Cài đặt</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2"><Moon className="w-4 h-4" /> Chế độ tối</span>
            <button
              onClick={() => { document.documentElement.classList.toggle("dark"); setDarkMode((v) => !v); }}
              className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? "bg-primary" : "bg-gray-300"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm flex items-center gap-2"><Bell className="w-4 h-4" /> Thông báo</span>
            <button className="w-11 h-6 rounded-full bg-primary relative">
              <span className="absolute top-0.5 translate-x-5 w-5 h-5 bg-white rounded-full" />
            </button>
          </div>
        </div>
      </div>

      <button onClick={handleLogout} className="mt-6 w-full btn-outline flex items-center justify-center gap-2 !border-primary !text-primary">
        <LogOut className="w-4 h-4" /> Đăng xuất
      </button>
    </div>
  );
}
