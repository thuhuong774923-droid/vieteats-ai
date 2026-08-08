"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import DishCard, { DishCardSkeleton } from "@/components/DishCard";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const REGIONS = ["Bắc", "Trung", "Nam"];
const SORT_OPTIONS = [
  { value: "-rating", label: "Đánh giá cao nhất" },
  { value: "-viewCount", label: "Lượt xem nhiều nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "price", label: "Giá thấp đến cao" },
  { value: "-price", label: "Giá cao đến thấp" },
];

export default function MenuPage() {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("-rating");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["menu-foods", { q, region, priceMax, sort, page }],
    queryFn: async () => {
      const params: Record<string, string> = { sort, page: String(page), limit: "24" };
      if (q) params.q = q;
      if (region) params.region = region;
      if (priceMax) params.priceMax = priceMax;
      const { data } = await api.get("/foods", { params });
      return data as { data: any[]; pagination: { total: number; pages: number } };
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-poppins text-2xl md:text-3xl font-bold mb-6">Thực đơn món ăn</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Tìm món ăn theo tên, vùng miền, nguyên liệu..."
            className="w-full pl-9 pr-3 py-3 rounded-xl2 bg-white dark:bg-white/10 border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="btn-outline flex items-center gap-2 justify-center"
        >
          <SlidersHorizontal className="w-4 h-4" /> Bộ lọc
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-3 rounded-xl2 bg-white dark:bg-white/10 border border-black/5 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {showFilters && (
        <div className="card-md3 p-4 mb-6 flex flex-wrap gap-4">
          <div>
            <p className="text-xs font-medium mb-2">Vùng miền</p>
            <div className="flex gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRegion(region === r ? "" : r); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    region === r ? "bg-primary text-white border-primary" : "border-black/10 hover:border-primary"
                  }`}
                >
                  Miền {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium mb-2">Giá tối đa</p>
            <input
              type="number"
              value={priceMax}
              onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
              placeholder="VD: 100000"
              className="px-3 py-1.5 rounded-xl2 border border-black/10 text-xs w-36"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => <DishCardSkeleton key={i} />)
          : data?.data.map((food) => (
              <DishCard
                key={food._id}
                id={food._id}
                name={food.name}
                image={food.images?.[0] || "https://picsum.photos/400"}
                rating={food.rating}
                province={food.province?.name || ""}
                priceMin={food.priceMin}
                priceMax={food.priceMax}
              />
            ))}
      </div>

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 rounded-full border border-black/10 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm">Trang {page} / {data.pagination.pages}</span>
          <button
            disabled={page >= data.pagination.pages}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 rounded-full border border-black/10 disabled:opacity-30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
