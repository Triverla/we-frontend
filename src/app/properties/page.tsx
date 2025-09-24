"use client";

import { Suspense } from "react";
import { PropertiesContent } from "./PropertiesContent";

export default function PropertiesPage() {
  return (
    <div className="bg-[#EEEEEE] min-h-screen">
      <Suspense fallback={
        <div className="w-full max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8)
              .fill(null)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 animate-pulse rounded-lg"
                />
              ))}
          </div>
        </div>
      }>
        <PropertiesContent />
      </Suspense>
    </div>
  );
}

