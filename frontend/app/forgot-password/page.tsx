"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Mail, KeyRound, Lock } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await api.post("/auth/forgot-password", { email });
    setMessage(data.message);
    setStep(2);
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/auth/reset-password", { email, otp, newPassword });
    router.push("/login");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card-md3 p-8 w-full max-w-md">
        <h1 className="font-poppins text-2xl font-bold text-center mb-6">Quên mật khẩu</h1>

        {step === 1 ? (
          <form onSubmit={requestOtp} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email tài khoản" className="w-full pl-9 pr-3 py-3 rounded-xl2 border border-black/10 bg-transparent focus:outline-none" />
            </div>
            <button type="submit" className="btn-primary w-full">Gửi mã OTP</button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="space-y-4">
            {message && <p className="text-xs text-secondary">{message}</p>}
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input required value={otp} onChange={(e) => setOtp(e.target.value)}
                placeholder="Mã OTP (6 số)" className="w-full pl-9 pr-3 py-3 rounded-xl2 border border-black/10 bg-transparent focus:outline-none" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mật khẩu mới" className="w-full pl-9 pr-3 py-3 rounded-xl2 border border-black/10 bg-transparent focus:outline-none" />
            </div>
            <button type="submit" className="btn-primary w-full">Đặt lại mật khẩu</button>
          </form>
        )}

        <p className="text-center text-sm mt-6">
          <Link href="/login" className="text-primary font-semibold hover:underline">Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
