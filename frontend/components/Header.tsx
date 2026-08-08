"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Bell, Sun, Moon, Menu as MenuIcon, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, toggleDarkMode } from "@/lib/store";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/menu", label: "Menu" },
  { href: "/provinces", label: "Đặc sản địa phương" },
  { href: "/ai-assistant", label: "AI Assistant" },
  { href: "/map", label: "Bản đồ" },
  { href: "/community", label: "Cộng đồng" },
  { href: "/passport", label: "Food Passport" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.user.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleToggleDark = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setDark(isDark);
    localStorage.setItem("vieteats_dark_mode", String(isDark));
    dispatch(toggleDarkMode());
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-glass" : "bg-background/80 dark:bg-background-dark/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative w-9 h-9 shrink-0">
            <Image src="/icons/icon-192.png" alt="VietEats AI" fill className="object-contain" priority />
          </div>
          <span className="font-poppins font-bold text-lg text-primary hidden sm:block">
            VietEats <span className="text-secondary">AI</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-xl2 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center flex-1 max-w-xs relative">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm món ăn, quán ăn, tỉnh thành..."
            className="w-full pl-9 pr-3 py-2 rounded-xl2 bg-white/70 dark:bg-white/10 border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleToggleDark} className="p-2 rounded-full hover:bg-primary/10 transition-colors" aria-label="Chuyển giao diện sáng/tối">
            {dark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-primary" />}
          </button>
          <button className="p-2 rounded-full hover:bg-primary/10 transition-colors relative" aria-label="Thông báo">
            <Bell className="w-5 h-5 text-primary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full" />
          </button>

          {user ? (
            <Link href="/profile">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"}
                alt={user.name}
                className="w-9 h-9 rounded-full border-2 border-primary object-cover"
              />
            </Link>
          ) : (
            <Link href="/login" className="btn-primary hidden sm:inline-block !py-2 !px-4 text-sm">
              Đăng nhập
            </Link>
          )}

          <button
            className="lg:hidden p-2 rounded-full hover:bg-primary/10"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Mở menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="lg:hidden glass px-4 pb-4 flex flex-col gap-1"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl2 text-sm font-medium hover:bg-primary/10 hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </motion.div>
      )}
    </header>
  );
}
