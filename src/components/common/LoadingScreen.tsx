// src/components/common/LoadingScreen.tsx
// Экран загрузки для приложения

"use client";

import React from "react";
import { UtensilsCrossed } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Загрузка..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <UtensilsCrossed className="h-16 w-16 text-indigo-600 mx-auto animate-pulse" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          RestaurantBooking
        </h1>

        <p className="text-gray-600 mb-8">{message}</p>

        <div className="flex justify-center">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
