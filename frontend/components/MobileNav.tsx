"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Sparkles, MapPin, User } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/ai-assistant", label: "AI", icon: Sparkles },
  { href: "/map", label: "Bản đồ", icon: MapPin },
  { href: "/profile", label: "Hồ sơ", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-black/5 flex items-center justify-around h-16 px-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative"
          >
            {active && (
              <span className="absolute top-0 w-8 h-1 rounded-full bg-primary" />
            )}
            <Icon
              className={clsx("w-5 h-5 transition-colors", active ? "text-primary" : "text-gray-400")}
              strokeWidth={active ? 2.5 : 2}
            />
            <span className={clsx("text-[10px] font-medium", active ? "text-primary" : "text-gray-400")}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
