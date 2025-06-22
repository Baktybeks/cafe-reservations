// src/app/(dashboard)/customer/favorites/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useAppDataStore } from "@/store/appStore";
import { Heart, Search, Filter, ArrowLeft } from "lucide-react";
import { UserRole } from "@/types";

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { favoriteRestaurants, removeFavoriteRestaurant } = useAppDataStore();

  // Получаем все рестораны
  const { data: allRestaurants = [], isLoading } = useRestaurants();

  // Фильтруем только избранные
  const favoriteRestaurantsList = allRestaurants.filter((restaurant) =>
    favoriteRestaurants.includes(restaurant.$id)
  );

  // Проверяем права доступа
  if (!user || ![UserRole.CUSTOMER, UserRole.ADMIN].includes(user.role)) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              У вас нет прав для просмотра избранного.
            </p>
            <Button onClick={() => router.push("/")}>На главную</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleBookingClick = (restaurant: any) => {
    router.push(`/restaurants/${restaurant.$id}/book`);
  };

  const handleFavoriteClick = (restaurant: any) => {
    removeFavoriteRestaurant(restaurant.$id);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/customer")}
                  icon={ArrowLeft}
                >
                  Назад
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Heart className="h-6 w-6 mr-3 text-red-500" />
                    Избранные рестораны
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {favoriteRestaurantsList.length} избранных ресторанов
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => router.push("/restaurants")}
                icon={Search}
              >
                Найти больше
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : favoriteRestaurantsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRestaurantsList.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.$id}
                  restaurant={restaurant}
                  onBookClick={handleBookingClick}
                  onFavoriteClick={handleFavoriteClick}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Нет избранных ресторанов
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Добавляйте рестораны в избранное, нажимая на сердечко в
                    карточке ресторана
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      icon={Search}
                      onClick={() => router.push("/restaurants")}
                    >
                      Найти рестораны
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/customer")}
                    >
                      В личный кабинет
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Подсказки */}
          {favoriteRestaurantsList.length > 0 && (
            <Card className="mt-8">
              <CardContent>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    💡 Полезные советы:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • Нажмите на сердечко еще раз, чтобы убрать из избранного
                    </li>
                    <li>
                      • Бронируйте столики заранее в популярных ресторанах
                    </li>
                    <li>
                      • Следите за специальными предложениями любимых мест
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
