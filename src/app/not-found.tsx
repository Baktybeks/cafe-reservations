// src/app/not-found.tsx

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Button } from "@/components/ui/Button";
import { Home, ArrowLeft, Search, UtensilsCrossed, MapPin } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative">
              <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <UtensilsCrossed className="h-16 w-16 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Страница не найдена
            </h1>
            <p className="text-gray-600 mb-4">
              К сожалению, мы не можем найти страницу, которую вы ищете.
              Возможно, она была перемещена или не существует.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => router.push("/")}
              size="lg"
              fullWidth
              icon={Home}
            >
              На главную
            </Button>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                icon={ArrowLeft}
                className="flex-1"
              >
                Назад
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/restaurants")}
                icon={Search}
                className="flex-1"
              >
                Рестораны
              </Button>
            </div>
          </div>

          {/* Popular Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Популярные разделы:
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <button
                onClick={() => router.push("/restaurants")}
                className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UtensilsCrossed className="h-4 w-4 mr-2 text-gray-400" />
                Рестораны
              </button>

              <button
                onClick={() => router.push("/customer")}
                className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Search className="h-4 w-4 mr-2 text-gray-400" />
                Поиск
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-xs text-gray-500">
            <p>
              Если проблема повторяется, свяжитесь с поддержкой:
              <a
                href="mailto:support@restaurantbooking.com"
                className="text-indigo-600 hover:text-indigo-700 ml-1"
              >
                support@restaurantbooking.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
