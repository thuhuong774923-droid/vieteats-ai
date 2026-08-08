"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import HeroBanner from "@/components/HeroBanner";
import DishCard, { DishCardSkeleton } from "@/components/DishCard";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface FoodItem {
  _id: string;
  name: string;
  images: string[];
  rating: number;
  priceMin: number;
  priceMax: number;
  province?: { name: string };
}

function useFoods(params: Record<string, string>) {
  return useQuery({
    queryKey: ["foods", params],
    queryFn: async () => {
      const { data } = await api.get("/foods", { params });
      return data.data as FoodItem[];
    },
  });
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-poppins text-xl md:text-2xl font-bold">{title}</h2>
        <Link href={href} className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
          Xem tất cả <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      {children}
    </section>
  );
}

function FoodGrid({ data, isLoading }: { data?: FoodItem[]; isLoading: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => <DishCardSkeleton key={i} />)
        : data?.map((food, i) => (
            <motion.div
              key={food._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <DishCard
                id={food._id}
                name={food.name}
                image={food.images?.[0] || "https://picsum.photos/400"}
                rating={food.rating}
                province={food.province?.name || ""}
                priceMin={food.priceMin}
                priceMax={food.priceMax}
              />
            </motion.div>
          ))}
    </div>
  );
}

export default function HomePage() {
  const featured = useFoods({ sort: "-rating", limit: "6" });
  const newest = useFoods({ sort: "newest", limit: "6" });
  const bac = useFoods({ region: "Bắc", limit: "6" });
  const trung = useFoods({ region: "Trung", limit: "6" });
  const nam = useFoods({ region: "Nam", limit: "6" });

  return (
    <div className="pb-12">
      <HeroBanner />

      <Section title="🌟 Đặc sản nổi bật" href="/menu?sort=-rating">
        <FoodGrid data={featured.data} isLoading={featured.isLoading} />
      </Section>

      <Section title="🆕 Món ăn mới nhất" href="/menu?sort=newest">
        <FoodGrid data={newest.data} isLoading={newest.isLoading} />
      </Section>

      <Section title="🥢 Ẩm thực miền Bắc" href="/menu?region=Bắc">
        <FoodGrid data={bac.data} isLoading={bac.isLoading} />
      </Section>

      <Section title="🍜 Ẩm thực miền Trung" href="/menu?region=Trung">
        <FoodGrid data={trung.data} isLoading={trung.isLoading} />
      </Section>

      <Section title="🍚 Ẩm thực miền Nam" href="/menu?region=Nam">
        <FoodGrid data={nam.data} isLoading={nam.isLoading} />
      </Section>
    </div>
  );
}
