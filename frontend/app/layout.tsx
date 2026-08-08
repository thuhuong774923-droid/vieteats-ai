import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const poppins = Poppins({
  subsets: ["latin", "latin","latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});
const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vieteats.ai";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VietEats AI - Khám phá tinh hoa ẩm thực Việt Nam",
    template: "%s | VietEats AI",
  },
  description: "Khám phá 63 tỉnh thành và hơn 1000 món ăn đặc sản Việt Nam cùng trợ lý AI thông minh. Gợi ý món ăn, quán ngon, lịch trình du lịch ẩm thực theo ngân sách và sở thích của bạn.",
  keywords: ["ẩm thực Việt Nam", "đặc sản 63 tỉnh thành", "AI ẩm thực", "món ăn Việt Nam", "food passport", "du lịch ẩm thực"],
  applicationName: "VietEats AI",
  authors: [{ name: "VietEats AI" }],
  manifest: "/manifest.json",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: "VietEats AI",
    title: "VietEats AI - Khám phá tinh hoa ẩm thực Việt Nam",
    description: "Khám phá 63 tỉnh thành và hơn 1000 món ăn đặc sản Việt Nam cùng trợ lý AI thông minh.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "VietEats AI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VietEats AI - Khám phá tinh hoa ẩm thực Việt Nam",
    description: "Khám phá 63 tỉnh thành và hơn 1000 món ăn đặc sản Việt Nam cùng trợ lý AI thông minh.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#D62828",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VietEats AI",
  url: SITE_URL,
  description: "Khám phá tinh hoa ẩm thực Việt Nam qua 63 tỉnh thành cùng trợ lý AI thông minh.",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/menu?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${poppins.variable} ${inter.variable} font-inter pb-16 md:pb-0`}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <MobileNav />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
