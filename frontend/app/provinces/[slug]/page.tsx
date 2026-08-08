"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import api from "@/lib/axios";
import DishCard from "@/components/DishCard";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export default function ProvinceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["province", slug],
    queryFn: async () => {
      const { data } = await api.get(`/provinces/${slug}`);
      return data.data as { province: any; foods: any[]; restaurants: any[] };
    },
  });
  const [aiStory, setAiStory] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const tellStory = async () => {
    setLoadingAI(true);
    try {
      const { data } = await api.get(`/provinces/${slug}/ai-story`);
      setAiStory(data.data);
    } finally {
      setLoadingAI(false);
    }
  };

  if (isLoading) return <div className="max-w-6xl mx-auto px-4 py-10"><div className="skeleton h-96" /></div>;
  if (!data) return null;
  const { province, foods, restaurants } = data;

  return (
    <div>
      <div className="relative h-64 md:h-80 w-full">
        <Image src={province.coverImage} alt={province.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 flex items-end">
          <div className="max-w-6xl mx-auto px-4 md:px-6 pb-6 w-full text-white">
            <h1 className="font-poppins text-3xl md:text-4xl font-bold">{province.name}</h1>
            <p className="text-white/80">Miền {province.region} Việt Nam</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <section className="card-md3 p-5 mb-6">
          <h2 className="font-poppins font-bold text-lg mb-2">Giới thiệu</h2>
          <p className="text-sm leading-relaxed mb-2">{province.description}</p>
          <p className="text-sm leading-relaxed mb-2"><strong>Lịch sử:</strong> {province.history}</p>
          <p className="text-sm leading-relaxed"><strong>Ẩm thực:</strong> {province.cuisine}</p>
        </section>

        <section className="card-md3 p-5 mb-6 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-poppins font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI kể chuyện {province.name}
            </h2>
            {!aiStory && (
              <button onClick={tellStory} disabled={loadingAI} className="btn-primary !py-1.5 !px-4 text-xs">
                {loadingAI ? "Đang kể..." : "Nghe AI kể chuyện"}
              </button>
            )}
          </div>
          {aiStory && <p className="text-sm leading-relaxed">{aiStory}</p>}
        </section>

        <section className="mb-6">
          <h2 className="font-poppins font-bold text-lg mb-3">🎉 Lễ hội nổi bật</h2>
          <div className="flex gap-3 flex-wrap">
            {(province.festivals || []).map((f: any, i: number) => (
              <div key={i} className="card-md3 p-4 min-w-[180px]">
                <p className="font-semibold text-sm">{f.name}</p>
                <p className="text-xs text-gray-500">{f.time}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="font-poppins font-bold text-lg mb-3">🍽️ Đặc sản {province.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {foods.map((f) => (
              <DishCard key={f._id} id={f._id} name={f.name} image={f.images?.[0] || "https://picsum.photos/400"} rating={f.rating} province={province.name} priceMin={f.priceMin} priceMax={f.priceMax} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-poppins font-bold text-lg mb-3">🏮 Quán nổi tiếng</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {restaurants.map((r) => (
              <div key={r._id} className="card-md3 p-4 flex gap-3">
                <div className="relative w-20 h-20 rounded-xl2 overflow-hidden shrink-0">
                  <Image src={r.images?.[0] || "https://picsum.photos/200"} alt={r.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.address}</p>
                  <p className="text-xs text-accent mt-1">★ {r.rating?.toFixed(1)} ({r.ratingCount})</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
