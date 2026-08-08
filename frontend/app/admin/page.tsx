"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend,
} from "chart.js";
import { Users, UtensilsCrossed, Store, Star, MessageSquare } from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/admin/dashboard");
      return data.data;
    },
  });

  const statCards = [
    { label: "Người dùng", value: data?.counts?.userCount, icon: Users, color: "bg-primary" },
    { label: "Món ăn", value: data?.counts?.foodCount, icon: UtensilsCrossed, color: "bg-secondary" },
    { label: "Nhà hàng", value: data?.counts?.restaurantCount, icon: Store, color: "bg-accent" },
    { label: "Đánh giá", value: data?.counts?.reviewCount, icon: Star, color: "bg-primary-dark" },
    { label: "Bài đăng", value: data?.counts?.postCount, icon: MessageSquare, color: "bg-secondary-light" },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8">
        <h1 className="font-poppins text-2xl font-bold mb-6">📊 Tổng quan hệ thống</h1>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {statCards.map((c) => (
            <div key={c.label} className="card-md3 p-4">
              <div className={`w-9 h-9 rounded-full ${c.color} flex items-center justify-center text-white mb-2`}>
                <c.icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-bold font-poppins">{isLoading ? "..." : c.value?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card-md3 p-5">
            <h2 className="font-poppins font-semibold mb-4">Top món ăn được đánh giá cao</h2>
            {!isLoading && data?.topFoods && (
              <Bar
                data={{
                  labels: data.topFoods.map((f: any) => f.name),
                  datasets: [{ label: "Rating", data: data.topFoods.map((f: any) => f.rating), backgroundColor: "#D62828" }],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
              />
            )}
          </div>

          <div className="card-md3 p-5">
            <h2 className="font-poppins font-semibold mb-4">Đánh giá theo tháng</h2>
            {!isLoading && data?.reviewsByMonth && (
              <Line
                data={{
                  labels: data.reviewsByMonth.map((r: any) => `${r._id.month}/${r._id.year}`),
                  datasets: [{ label: "Số đánh giá", data: data.reviewsByMonth.map((r: any) => r.count), borderColor: "#F77F00", backgroundColor: "#FFD16680", tension: 0.4 }],
                }}
                options={{ responsive: true }}
              />
            )}
          </div>

          <div className="card-md3 p-5 lg:col-span-2">
            <h2 className="font-poppins font-semibold mb-4">Top tỉnh thành có nhiều món ăn nhất</h2>
            {!isLoading && data?.topProvinces && (
              <Bar
                data={{
                  labels: data.topProvinces.map((p: any) => p.province.name),
                  datasets: [{ label: "Số món ăn", data: data.topProvinces.map((p: any) => p.foodCount), backgroundColor: "#FFD166" }],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
