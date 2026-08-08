"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import AdminSidebar from "@/components/AdminSidebar";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend,
} from "chart.js";
import Image from "next/image";
import { Trophy } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const REGION_COLORS: Record<string, string> = { "Bắc": "#D62828", "Trung": "#F77F00", "Nam": "#FFD166" };

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data } = await api.get("/admin/analytics");
      return data.data;
    },
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-poppins text-2xl font-bold mb-6">📈 Phân tích chuyên sâu</h1>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-md3 p-5">
            <h2 className="font-poppins font-semibold mb-4">Người dùng mới theo tháng</h2>
            {!isLoading && data?.usersByMonth && (
              <Line
                data={{
                  labels: data.usersByMonth.map((u: any) => `${u._id.month}/${u._id.year}`),
                  datasets: [{ label: "Người dùng mới", data: data.usersByMonth.map((u: any) => u.count), borderColor: "#D62828", backgroundColor: "#D6282840", tension: 0.4 }],
                }}
                options={{ responsive: true }}
              />
            )}
          </div>

          <div className="card-md3 p-5">
            <h2 className="font-poppins font-semibold mb-4">Phân bố món ăn theo vùng miền</h2>
            {!isLoading && data?.regionDistribution && (
              <Doughnut
                data={{
                  labels: data.regionDistribution.map((r: any) => `Miền ${r._id}`),
                  datasets: [{
                    data: data.regionDistribution.map((r: any) => r.count),
                    backgroundColor: data.regionDistribution.map((r: any) => REGION_COLORS[r._id] || "#999"),
                  }],
                }}
              />
            )}
          </div>

          <div className="card-md3 p-5 lg:col-span-2">
            <h2 className="font-poppins font-semibold mb-4 flex items-center gap-2"><Trophy className="w-4 h-4 text-accent" /> Top người dùng theo điểm</h2>
            <div className="space-y-2">
              {data?.topUsersByPoints?.map((u: any, i: number) => (
                <div key={u._id} className="flex items-center gap-3 text-sm">
                  <span className="w-5 text-center font-bold">{i + 1}</span>
                  <Image src={u.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=u"} alt="" width={28} height={28} className="rounded-full" />
                  <span className="flex-1">{u.name}</span>
                  <span className="font-semibold text-primary">{u.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
