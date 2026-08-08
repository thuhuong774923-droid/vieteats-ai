"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Image from "next/image";
import api from "@/lib/axios";
import { Star, Bookmark, Share2, MapPin, Flame, Sparkles } from "lucide-react";
import DishCard from "@/components/DishCard";
import { useState } from "react";

export default function DishDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ["food", id],
    queryFn: async () => {
      const { data } = await api.get(`/foods/${id}`);
      return data.data as { food: any; related: any[] };
    },
  });

  const [aiExplain, setAiExplain] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const askAI = async () => {
    setLoadingAI(true);
    try {
      const { data } = await api.get(`/foods/${id}/ai-explain`);
      setAiExplain(data.data);
    } finally {
      setLoadingAI(false);
    }
  };

  if (isLoading) {
    return <div className="max-w-5xl mx-auto px-4 py-10"><div className="skeleton h-96 w-full" /></div>;
  }
  if (!data) return null;

  const { food, related } = data;

  const recipeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: food.name,
    image: food.images || [],
    author: { "@type": "Organization", name: "VietEats AI" },
    description: food.story?.origin || food.name,
    recipeCategory: food.category?.name,
    recipeCuisine: `Việt Nam - ${food.region}`,
    keywords: (food.tags || []).join(", "),
    recipeIngredient: food.ingredients || [],
    recipeInstructions: (food.recipe || []).map((r: any) => ({
      "@type": "HowToStep",
      text: r.description,
    })),
    nutrition: {
      "@type": "NutritionInformation",
      calories: `${food.nutrition?.calories} kcal`,
      proteinContent: `${food.nutrition?.protein} g`,
      fatContent: `${food.nutrition?.fat} g`,
      carbohydrateContent: `${food.nutrition?.carb} g`,
    },
    aggregateRating: food.ratingCount > 0 ? {
      "@type": "AggregateRating",
      ratingValue: food.rating,
      ratingCount: food.ratingCount,
    } : undefined,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }} />
      <div className="relative h-72 md:h-96 rounded-xl2 overflow-hidden">
        <Image src={food.images?.[0] || "https://picsum.photos/800"} alt={food.name} fill className="object-cover" />
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2">
        {(food.images || []).slice(0, 3).map((img: string, i: number) => (
          <div key={i} className="relative h-20 rounded-xl2 overflow-hidden">
            <Image src={img} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>

      <div className="flex items-start justify-between mt-6">
        <div>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold">{food.name}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {food.province?.name}</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-accent text-accent" /> {food.rating?.toFixed(1)} ({food.ratingCount})</span>
            <span className="flex items-center gap-1"><Flame className="w-4 h-4 text-primary" /> Độ cay {food.spiceLevel}/5</span>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {(food.tags || []).map((t: string) => (
              <span key={t} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">#{t}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-3 rounded-full border border-black/10 hover:bg-primary hover:text-white transition-colors"><Bookmark className="w-4 h-4" /></button>
          <button className="p-3 rounded-full border border-black/10 hover:bg-primary hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
        </div>
      </div>

      <p className="mt-4 text-lg font-semibold text-primary">
        {food.priceMin?.toLocaleString()}đ - {food.priceMax?.toLocaleString()}đ
      </p>

      {/* Câu chuyện & văn hoá */}
      <section className="mt-8 card-md3 p-5">
        <h2 className="font-poppins font-bold text-lg mb-3">📖 Lịch sử & Câu chuyện</h2>
        <p className="text-sm leading-relaxed mb-2"><strong>Nguồn gốc:</strong> {food.story?.origin}</p>
        <p className="text-sm leading-relaxed mb-2"><strong>Lịch sử:</strong> {food.story?.history}</p>
        <p className="text-sm leading-relaxed"><strong>Ý nghĩa văn hoá:</strong> {food.story?.culturalMeaning}</p>
      </section>

      {/* Thành phần dinh dưỡng */}
      <section className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Calories", value: `${food.nutrition?.calories} kcal` },
          { label: "Protein", value: `${food.nutrition?.protein} g` },
          { label: "Fat", value: `${food.nutrition?.fat} g` },
          { label: "Carb", value: `${food.nutrition?.carb} g` },
        ].map((n) => (
          <div key={n.label} className="card-md3 p-4 text-center">
            <p className="text-xs text-gray-500">{n.label}</p>
            <p className="font-poppins font-bold text-primary">{n.value}</p>
          </div>
        ))}
      </section>

      {/* Nguyên liệu & cách chế biến */}
      <section className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="card-md3 p-5">
          <h3 className="font-poppins font-semibold mb-3">🧂 Nguyên liệu</h3>
          <ul className="text-sm space-y-1.5 list-disc list-inside text-gray-600 dark:text-gray-300">
            {(food.ingredients || []).map((ing: string, i: number) => <li key={i}>{ing}</li>)}
          </ul>
        </div>
        <div className="card-md3 p-5">
          <h3 className="font-poppins font-semibold mb-3">👨‍🍳 Cách chế biến</h3>
          <ol className="text-sm space-y-1.5 list-decimal list-inside text-gray-600 dark:text-gray-300">
            {(food.recipe || []).map((r: any) => <li key={r.step}>{r.description}</li>)}
          </ol>
        </div>
      </section>

      {/* AI giải thích */}
      <section className="mt-6 card-md3 p-5 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-poppins font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> AI giải thích món ăn
          </h3>
          {!aiExplain && (
            <button onClick={askAI} disabled={loadingAI} className="btn-primary !py-1.5 !px-4 text-xs">
              {loadingAI ? "Đang tạo..." : "Hỏi AI"}
            </button>
          )}
        </div>
        {aiExplain && <p className="text-sm leading-relaxed">{aiExplain}</p>}
      </section>

      {/* Món liên quan */}
      {related?.length > 0 && (
        <section className="mt-10">
          <h2 className="font-poppins text-xl font-bold mb-4">Món ăn liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map((f: any) => (
              <DishCard
                key={f._id}
                id={f._id}
                name={f.name}
                image={f.images?.[0] || "https://picsum.photos/400"}
                rating={f.rating}
                province=""
                priceMin={f.priceMin}
                priceMax={f.priceMax}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
