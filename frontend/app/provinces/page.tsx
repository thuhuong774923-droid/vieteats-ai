"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";
import { motion } from "framer-motion";

const REGIONS = ["Bắc", "Trung", "Nam"];

export default function ProvincesPage() {
  const [region, setRegion] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["provinces", region],
    queryFn: async () => {
      const { data } = await api.get("/provinces", { params: region ? { region } : {} });
      return data.data as any[];
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-poppins text-2xl md:text-3xl font-bold mb-2">Đặc sản 63 tỉnh thành</h1>
      <p className="text-gray-500 mb-6">Khám phá lịch sử, ẩm thực và văn hoá từng vùng miền Việt Nam.</p>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setRegion("")} className={`px-4 py-1.5 rounded-full text-sm border ${!region ? "bg-primary text-white border-primary" : "border-black/10"}`}>Tất cả</button>
        {REGIONS.map((r) => (
          <button key={r} onClick={() => setRegion(r)} className={`px-4 py-1.5 rounded-full text-sm border ${region === r ? "bg-primary text-white border-primary" : "border-black/10"}`}>
            Miền {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-48" />)
          : data?.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link href={`/provinces/${p.slug}`} className="card-md3 overflow-hidden block group">
                  <div className="relative h-32 w-full overflow-hidden">
                    <Image src={p.coverImage} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px]">Miền {p.region}</span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-poppins font-semibold text-sm">{p.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
    </div>
  );
}
