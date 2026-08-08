"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import api from "@/lib/axios";
import { setUser } from "@/lib/store";

declare global {
  interface Window {
    google?: any;
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function GoogleLoginButton() {
  const btnRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!CLIENT_ID) return;

    const handleCredentialResponse = async (response: any) => {
      try {
        const { data } = await api.post("/auth/google", { idToken: response.credential });
        localStorage.setItem("vieteats_token", data.data.accessToken);
        dispatch(setUser(data.data.user));
        router.push("/");
      } catch (err) {
        console.error("Đăng nhập Google thất bại:", err);
      }
    };

    const initGoogle = () => {
      if (!window.google || !btnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        locale: "vi",
      });
      setReady(true);
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    }
  }, [dispatch, router]);

  if (!CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        title="Cần cấu hình NEXT_PUBLIC_GOOGLE_CLIENT_ID trong frontend/.env"
        className="btn-outline !py-2 text-xs opacity-50 cursor-not-allowed w-full"
      >
        Google (chưa cấu hình)
      </button>
    );
  }

  return <div ref={btnRef} className={ready ? "" : "hidden"} />;
}
