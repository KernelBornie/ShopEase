"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export function ProductSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Top Banner Indicator Spinner */}
      <div className="flex items-center justify-center gap-2.5 py-3 px-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-bold animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
        <span>Fetching live catalog items from database...</span>
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl overflow-hidden border border-stone-100 p-5 space-y-4 shadow-xs animate-pulse"
          >
            {/* Image Placeholder */}
            <div className="aspect-square w-full bg-stone-150 rounded-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-200/50 to-transparent animate-shimmer" />
            </div>

            {/* Category & Title Placeholders */}
            <div className="space-y-2">
              <div className="h-3.5 bg-stone-200 rounded-full w-1/3" />
              <div className="h-5 bg-stone-250 rounded-lg w-3/4" />
              <div className="h-3 bg-stone-150 rounded-md w-full" />
              <div className="h-3 bg-stone-150 rounded-md w-2/3" />
            </div>

            {/* Footer Buttons Placeholder */}
            <div className="pt-4 border-t border-stone-100 flex gap-2">
              <div className="h-9 bg-stone-150 rounded-xl flex-1" />
              <div className="h-9 bg-emerald-100/60 rounded-xl flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductSkeletonGrid;
