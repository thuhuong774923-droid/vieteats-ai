"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard, Users, UtensilsCrossed, Store, MapPin, MessageSquare,
  Star, Flag, BarChart3, Sparkles, Settings,
} from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/foods", label: "Foods", icon: UtensilsCrossed },
  { href: "/admin/restaurants", label: "Restaurants", icon: Store },
  { href: "/admin/locations", label: "Locations", icon: MapPin },
  { href: "/admin/community", label: "Community", icon: MessageSquare },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/ai-logs", label: "AI Logs", icon: Sparkles },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-black/5 bg-white dark:bg-surface-dark min-h-screen p-4">
      <div className="flex items-center gap-2 mb-6 px-2">
        <div className="relative w-8 h-8 shrink-0">
          <Image src="/icons/icon-192.png" alt="VietEats AI" fill className="object-contain" />
        </div>
        <span className="font-poppins font-bold text-sm">Admin CMS</span>
      </div>
      <nav className="flex flex-col gap-1">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl2 text-sm font-medium transition-colors",
                active ? "bg-primary text-white" : "hover:bg-primary/10 text-gray-600 dark:text-gray-300"
              )}
            >
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
