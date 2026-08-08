"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import Image from "next/image";
import api from "@/lib/axios";
import { setUser } from "@/lib/store";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import FacebookLoginButton from "@/components/FacebookLoginButton";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("vieteats_token", data.data.accessToken);
      dispatch(setUser(data.data.user));
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card-md3 p-8 w-full max-w-md">
        <div className="relative w-16 h-16 mx-auto mb-3">
          <Image src="/icons/icon-192.png" alt="VietEats AI" fill className="object-contain" />
        </div>
        <h1 className="font-poppins text-2xl font-bold text-center mb-1">Tạo tài khoản mới 🚀</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Tham gia cộng đồng ẩm thực VietEats AI</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input required placeholder="Họ và tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full pl-9 pr-3 py-3 rounded-xl2 border border-black/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-9 pr-3 py-3 rounded-xl2 border border-black/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="password" required minLength={6} placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-9 pr-3 py-3 rounded-xl2 border border-black/10 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          {error && <p className="text-xs text-primary">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Đăng ký
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-black/10" /><span className="text-xs text-gray-400">hoặc</span><div className="flex-1 h-px bg-black/10" />
        </div>

        <div className="flex flex-col gap-2 mb-2">
          <div className="flex justify-center">
            <GoogleLoginButton />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FacebookLoginButton />
            <button type="button" disabled title="Cần cấu hình Apple Developer Service ID"
              className="btn-outline !py-2 text-xs opacity-50 cursor-not-allowed w-full">
              Apple
            </button>
          </div>
        </div>

        <p className="text-center text-sm mt-6">
          Đã có tài khoản? <Link href="/login" className="text-primary font-semibold hover:underline">Đăng nhập</Link>
        </p>
      </motion.div>
    </div>
  );
}
