"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "@/lib/axios";

// Fix icon mặc định của Leaflet khi dùng với Webpack/Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function RecenterButton() {
  const map = useMap();
  return (
    <button
      onClick={() => {
        navigator.geolocation?.getCurrentPosition((pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 13);
        });
      }}
      className="absolute z-[1000] bottom-4 right-4 btn-primary !py-2 !px-3 text-xs shadow-lg"
    >
      📍 Vị trí của tôi
    </button>
  );
}

export default function MapView() {
  const [restaurants, setRestaurants] = useState<any[]>([]);

  useEffect(() => {
    api.get("/restaurants", { params: { limit: 200 } }).then(({ data }) => setRestaurants(data.data));
  }, []);

  return (
    <div className="relative h-[70vh] w-full">
      <MapContainer center={[16.0544, 108.2022]} zoom={6} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((r) => (
          <Marker key={r._id} position={[r.location.lat, r.location.lng]} icon={defaultIcon}>
            <Popup>
              <strong>{r.name}</strong>
              <br />
              {r.address}
              <br />
              ★ {r.rating?.toFixed(1)}
            </Popup>
          </Marker>
        ))}
        <RecenterButton />
      </MapContainer>
    </div>
  );
}
