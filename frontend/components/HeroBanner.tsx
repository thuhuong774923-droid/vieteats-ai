"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Sparkles, MapPin, BookOpen, Trophy } from "lucide-react";

const SLIDES = [
  {
    title: "Khám phá tinh hoa ẩm thực Việt Nam",
    subtitle: "63 tỉnh thành • 1000+ món ăn đặc sản • Trợ lý AI thông minh",
    image: "https://picsum.photos/seed/vieteats-hero-1/1600/800",
  },
  {
    title: "Đặc sản mỗi vùng miền",
    subtitle: "Từ phở Hà Nội đến bún bò Huế, cơm tấm Sài Gòn",
    image: "https://picsum.photos/seed/vieteats-hero-2/1600/800",
  },
  {
    title: "AI Assistant - Người bạn ẩm thực",
    subtitle: "Gợi ý món ăn theo ngân sách, vị trí, sở thích của bạn",
    image: "https://picsum.photos/seed/vieteats-hero-3/1600/800",
  },
];

const QUICK_ACTIONS = [
  { icon: Sparkles, label: "AI Assistant", href: "/ai-assistant", color: "bg-primary" },
  { icon: MapPin, label: "Đặc sản địa phương", href: "/provinces", color: "bg-secondary" },
  { icon: BookOpen, label: "Food Passport", href: "/passport", color: "bg-accent" },
  { icon: Trophy, label: "Top Quán", href: "/menu?sort=-rating", color: "bg-primary-dark" },
];

export default function HeroBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative">
      <div className="relative h-[420px] md:h-[520px] w-full overflow-hidden rounded-b-[32px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Image src={SLIDES[index].image} alt={SLIDES[index].title} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 text-white">
          <motion.h1
            key={`title-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-poppins text-3xl md:text-5xl font-bold max-w-3xl leading-tight"
          >
            {SLIDES[index].title}
          </motion.h1>
          <motion.p
            key={`sub-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-3 text-white/90 max-w-xl"
          >
            {SLIDES[index].subtitle}
          </motion.p>

          <div className="flex gap-8 mt-8">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold font-poppins text-accent">63</p>
              <p className="text-xs md:text-sm text-white/80">tỉnh thành</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold font-poppins text-accent">1000+</p>
              <p className="text-xs md:text-sm text-white/80">món ăn</p>
            </div>
          </div>

          <Link href="/menu" className="btn-primary mt-6">
            Khám phá ngay
          </Link>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-accent" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20 grid grid-cols-2 md:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="glass rounded-xl2 p-4 flex flex-col items-center gap-2 shadow-glass hover:-translate-y-1 transition-transform"
          >
            <div className={`w-11 h-11 rounded-full ${action.color} flex items-center justify-center text-white`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-center">{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
