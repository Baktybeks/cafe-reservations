// src/app/restaurants/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { useRestaurants } from "@/hooks/useRestaurants";
import { useAuth } from "@/hooks/useAuth";
import { useAppDataStore } from "@/store/appStore";
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  Star,
  UtensilsCrossed,
  Grid3X3,
  List,
} from "lucide-react";
import {
  CuisineType,
  PriceRange,
  getCuisineTypeLabel,
  getPriceRangeLabel,
} from "@/types";

export default function RestaurantsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    addFavoriteRestaurant,
    removeFavoriteRestaurant,
    favoriteRestaurants,
  } = useAppDataStore();

  // Состояние фильтров
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>(
    []
  );
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"rating" | "name" | "newest">("rating");

  // Получаем рестораны с фильтрами
  const { data: restaurants = [], isLoading } = useRestaurants({
    searchQuery: searchQuery.trim(),
    city: selectedCity,
    cuisineType: selectedCuisines.length > 0 ? selectedCuisines : undefined,
    priceRange:
      selectedPriceRanges.length > 0 ? selectedPriceRanges : undefined,
    rating: minRating > 0 ? minRating : undefined,
  });

  // Обработчики
  const handleBookingClick = (restaurant: any) => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(`/restaurants/${restaurant.$id}/book`);
  };

  const handleFavoriteClick = (restaurant: any) => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (favoriteRestaurants.includes(restaurant.$id)) {
      removeFavoriteRestaurant(restaurant.$id);
    } else {
      addFavoriteRestaurant(restaurant.$id);
    }
  };

  const toggleCuisine = (cuisine: CuisineType) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const togglePriceRange = (priceRange: PriceRange) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(priceRange)
        ? prev.filter((p) => p !== priceRange)
        : [...prev, priceRange]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCity("");
    setSelectedCuisines([]);
    setSelectedPriceRanges([]);
    setMinRating(0);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCity ||
    selectedCuisines.length > 0 ||
    selectedPriceRanges.length > 0 ||
    minRating > 0;

  // Сортировка ресторанов
  const sortedRestaurants = [...restaurants].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.averageRating - a.averageRating;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
        return (
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <UtensilsCrossed className="h-6 w-6 mr-3 text-indigo-600" />
                  Рестораны
                </h1>
                <p className="text-gray-600 mt-1">
                  Найдите идеальное место для вашего ужина
                </p>
              </div>

              <div className="flex items-center space-x-3">
                {/* View Mode Toggle */}
                <div className="flex rounded-lg border border-gray-300">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${
                      viewMode === "grid"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${
                      viewMode === "list"
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="rating">По рейтингу</option>
                  <option value="name">По алфавиту</option>
                  <option value="newest">Новые сначала</option>
                </select>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
                {/* Search */}
                <div className="flex-1">
                  <Input
                    placeholder="Поиск ресторанов..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={Search}
                    className="w-full"
                  />
                </div>

                {/* City */}
                <div className="lg:w-48">
                  <Input
                    placeholder="Город"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    icon={MapPin}
                  />
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={showFilters ? SlidersHorizontal : Filter}
                >
                  Фильтры
                  {hasActiveFilters && (
                    <Badge variant="info" size="sm" className="ml-2">
                      {[
                        selectedCuisines.length,
                        selectedPriceRanges.length,
                        minRating > 0 ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                </Button>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters}>
                    Очистить
                  </Button>
                )}
              </div>

              {/* Extended Filters */}
              {showFilters && (
                <Card className="mt-4">
                  <CardContent className="space-y-6">
                    {/* Cuisine Types */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Тип кухни:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(CuisineType).map((cuisine) => (
                          <button
                            key={cuisine}
                            onClick={() => toggleCuisine(cuisine)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedCuisines.includes(cuisine)
                                ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                                : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                            }`}
                          >
                            {getCuisineTypeLabel(cuisine)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Ценовая категория:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.values(PriceRange).map((priceRange) => (
                          <button
                            key={priceRange}
                            onClick={() => togglePriceRange(priceRange)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedPriceRanges.includes(priceRange)
                                ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                                : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                            }`}
                          >
                            {getPriceRangeLabel(priceRange)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Минимальный рейтинг:
                      </h3>
                      <div className="flex space-x-2">
                        {[0, 3, 4, 4.5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setMinRating(rating)}
                            className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                              minRating === rating
                                ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                            }`}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            {rating === 0 ? "Любой" : `${rating}+`}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                {isLoading
                  ? "Загрузка..."
                  : `Найдено ресторанов: ${sortedRestaurants.length}`}
              </h2>
              {hasActiveFilters && (
                <p className="text-sm text-gray-600 mt-1">
                  Результаты с применением фильтров
                </p>
              )}
            </div>
          </div>

          {/* Restaurant List */}
          {isLoading ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : sortedRestaurants.length > 0 ? (
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {sortedRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.$id}
                  restaurant={restaurant}
                  onBookClick={handleBookingClick}
                  onFavoriteClick={user ? handleFavoriteClick : undefined}
                  variant={viewMode === "list" ? "compact" : "default"}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Рестораны не найдены
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {hasActiveFilters
                      ? "Попробуйте изменить критерии поиска"
                      : "В данный момент нет доступных ресторанов"}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Очистить фильтры
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA Section */}
        {!user && sortedRestaurants.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Готовы забронировать столик?
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Создайте аккаунт, чтобы бронировать столики, сохранять любимые
                  рестораны и получать персональные рекомендации.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={() => router.push("/register")}>
                    Зарегистрироваться
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/login")}
                  >
                    Войти
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
