"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { motion } from "framer-motion";
import { Award, MapPin, UtensilsCrossed, QrCode } from "lucide-react";

const TIER_COLORS: Record<string, string> = {
  Bronze: "from-amber-700 to-amber-500",
  Silver: "from-gray-400 to-gray-300",
  Gold: "from-yellow-500 to-accent",
  Diamond: "from-sky-400 to-primary",
};

export default function PassportPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-passport"],
    queryFn: async () => {
      const { data } = await api.get("/passport/me");
      return data.data;
    },
  });

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-10"><div className="skeleton h-80" /></div>;

  const explored = data?.exploredProvinces?.length || 0;
  const eaten = data?.eatenFoods?.length || 0;
  const progress = Math.min(100, Math.round((explored / 63) * 100));

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-poppins text-2xl md:text-3xl font-bold mb-2">🛂 Food Passport của bạn</h1>
      <p className="text-gray-500 mb-6">Sưu tập hành trình khám phá ẩm thực Việt Nam của bạn.</p>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl2 p-6 bg-gradient-to-br from-primary via-primary-dark to-secondary text-white shadow-glass relative overflow-hidden"
      >
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-xs opacity-80">VIETEATS AI PASSPORT</p>
            <p className="font-poppins text-xl font-bold mt-1">{data?.points || 0} điểm</p>
          </div>
          <QrCode className="w-16 h-16 opacity-90" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 relative z-10">
          <div>
            <p className="text-2xl font-bold font-poppins">{explored}/63</p>
            <p className="text-xs opacity-80">Tỉnh đã khám phá</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-poppins">{eaten}</p>
            <p className="text-xs opacity-80">Món đã thưởng thức</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-poppins">{data?.badges?.length || 0}</p>
            <p className="text-xs opacity-80">Huy hiệu đạt được</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden relative z-10">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </motion.div>

      <section className="mt-8">
        <h2 className="font-poppins font-bold text-lg mb-3 flex items-center gap-2"><Award className="w-5 h-5 text-accent" /> Huy hiệu (Achievement)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(data?.badges?.length ? data.badges : [{ tier: "Bronze", name: "Chưa mở khoá" }]).map((b: any, i: number) => (
            <div key={i} className={`card-md3 p-4 text-center bg-gradient-to-br ${TIER_COLORS[b.tier]} text-white`}>
              <Award className="w-8 h-8 mx-auto mb-1" />
              <p className="text-xs font-semibold">{b.name}</p>
              <p className="text-[10px] opacity-80">{b.tier}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-poppins font-bold text-lg mb-3 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Tỉnh đã khám phá</h2>
        <div className="flex flex-wrap gap-2">
          {data?.exploredProvinces?.length
            ? data.exploredProvinces.map((p: any, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {p.province?.name}
                </span>
              ))
            : <p className="text-sm text-gray-400">Chưa check-in tỉnh nào. Hãy khám phá bản đồ để bắt đầu!</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-poppins font-bold text-lg mb-3 flex items-center gap-2"><UtensilsCrossed className="w-5 h-5 text-secondary" /> Món đã thưởng thức</h2>
        <div className="flex flex-wrap gap-2">
          {data?.eatenFoods?.length
            ? data.eatenFoods.map((f: any, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                  {f.food?.name}
                </span>
              ))
            : <p className="text-sm text-gray-400">Chưa đánh dấu món ăn nào đã thử.</p>}
        </div>
      </section>
    </div>
  );
}
