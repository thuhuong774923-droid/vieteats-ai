"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return; // tránh cache gây khó chịu khi đang dev

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("✅ Service Worker đã đăng ký:", reg.scope))
        .catch((err) => console.warn("⚠️ Đăng ký Service Worker thất bại:", err));
    });
  }, []);

  return null;
}
