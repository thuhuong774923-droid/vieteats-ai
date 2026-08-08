"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="skeleton h-[70vh] w-full" />,
});

export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-poppins text-2xl md:text-3xl font-bold mb-2">🗺️ Bản đồ ẩm thực Việt Nam</h1>
      <p className="text-gray-500 mb-6">Khám phá quán ăn, đặc sản, lễ hội và địa điểm gần bạn.</p>
      <div className="card-md3 overflow-hidden">
        <MapView />
      </div>
    </div>
  );
}
