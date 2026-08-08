"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Bookmark, MapPin } from "lucide-react";

interface DishCardProps {
  id: string;
  slug?: string;
  name: string;
  image: string;
  rating: number;
  province: string;
  priceMin?: number;
  priceMax?: number;
}

export default function DishCard({ id, name, image, rating, province, priceMin, priceMax }: DishCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="card-md3 overflow-hidden group cursor-pointer"
    >
      <Link href={`/menu/${id}`}>
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-poppins font-semibold text-sm line-clamp-1">{name}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{province}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-accent">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              <span className="text-xs font-medium text-textmain dark:text-textmain-dark">{rating?.toFixed(1)}</span>
            </div>
            {priceMin && (
              <span className="text-xs font-semibold text-primary">
                {priceMin.toLocaleString()}đ{priceMax ? `-${priceMax.toLocaleString()}đ` : ""}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function DishCardSkeleton() {
  return (
    <div className="card-md3 overflow-hidden">
      <div className="skeleton h-40 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-3 w-full" />
      </div>
    </div>
  );
}
