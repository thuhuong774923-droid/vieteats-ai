"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Facebook, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { setUser } from "@/lib/store";

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

const APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

export default function FacebookLoginButton() {
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!APP_ID || window.FB) {
      if (window.FB) setSdkReady(true);
      return;
    }
    window.fbAsyncInit = () => {
      window.FB.init({ appId: APP_ID, cookie: true, xfbml: false, version: "v20.0" });
      setSdkReady(true);
    };
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/vi_VN/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const handleLogin = () => {
    if (!window.FB) return;
    setLoading(true);
    window.FB.login(
      async (response: any) => {
        if (response.authResponse) {
          try {
            const { data } = await api.post("/auth/facebook", { accessToken: response.authResponse.accessToken });
            localStorage.setItem("vieteats_token", data.data.accessToken);
            dispatch(setUser(data.data.user));
            router.push("/");
          } catch (err) {
            console.error("Đăng nhập Facebook thất bại:", err);
          }
        }
        setLoading(false);
      },
      { scope: "public_profile,email" }
    );
  };

  if (!APP_ID) {
    return (
      <button type="button" disabled title="Cần cấu hình NEXT_PUBLIC_FACEBOOK_APP_ID trong frontend/.env"
        className="btn-outline !py-2 text-xs opacity-50 cursor-not-allowed w-full flex items-center justify-center gap-1.5">
        <Facebook className="w-3.5 h-3.5" /> Facebook
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogin}
      disabled={!sdkReady || loading}
      className="btn-outline !py-2 text-xs w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Facebook className="w-3.5 h-3.5" />} Facebook
    </button>
  );
}
