import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vieteats.ai";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function fetchSlugs(path: string, field: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).map((item: any) => item[field]).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/menu`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/provinces`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/ai-assistant`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/map`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/passport`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/register`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Sinh URL động cho từng tỉnh thành (63 tỉnh) - lấy trực tiếp từ API khi backend đang chạy
  const provinceSlugs = await fetchSlugs("/provinces", "slug");
  const provinceRoutes: MetadataRoute.Sitemap = provinceSlugs.map((slug) => ({
    url: `${SITE_URL}/provinces/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...provinceRoutes];
}
