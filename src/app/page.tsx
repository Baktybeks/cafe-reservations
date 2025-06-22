// src/app/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useRestaurants, usePopularRestaurants } from "@/hooks/useRestaurants";
import { useAuth } from "@/hooks/useAuth";
import { useAppDataStore } from "@/store/appStore";
import {
  Search,
  MapPin,
  Star,
  TrendingUp,
  Calendar,
  UtensilsCrossed,
  Filter,
  Heart,
} from "lucide-react";
import {
  CuisineType,
  PriceRange,
  getCuisineTypeLabel,
  getPriceRangeLabel,
} from "@/types";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    addFavoriteRestaurant,
    removeFavoriteRestaurant,
    favoriteRestaurants,
  } = useAppDataStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<PriceRange[]>(
    []
  );
  const [showFilters, setShowFilters] = useState(false);

  // Получаем популярные рестораны
  const { data: popularRestaurants = [], isLoading: popularLoading } =
    usePopularRestaurants(8);

  // Получаем рестораны с фильтрами
  const { data: filteredRestaurants = [], isLoading: searchLoading } =
    useRestaurants({
      searchQuery: searchQuery.trim(),
      city: selectedCity,
      cuisineType: selectedCuisines.length > 0 ? selectedCuisines : undefined,
      priceRange:
        selectedPriceRanges.length > 0 ? selectedPriceRanges : undefined,
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Поиск уже происходит автоматически через useRestaurants
  };

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
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCity ||
    selectedCuisines.length > 0 ||
    selectedPriceRanges.length > 0;
  const showSearchResults = hasActiveFilters;

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Найдите идеальный ресторан
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Бронируйте столики в лучших ресторанах вашего города. Быстро,
              удобно, без звонков.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search input */}
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Название ресторана, кухня..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={Search}
                      className="text-gray-900"
                    />
                  </div>

                  {/* City input */}
                  <div>
                    <Input
                      placeholder="Город"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      icon={MapPin}
                      className="text-gray-900"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between mt-4 space-y-4 sm:space-y-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    icon={Filter}
                    className="text-gray-700"
                  >
                    Фильтры
                    {hasActiveFilters && (
                      <Badge variant="info" size="sm" className="ml-2">
                        {selectedCuisines.length +
                          selectedPriceRanges.length +
                          (searchQuery ? 1 : 0) +
                          (selectedCity ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>

                  <div className="flex space-x-3">
                    {hasActiveFilters && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-gray-600"
                      >
                        Очистить
                      </Button>
                    )}
                    <Button type="submit" size="lg" className="px-8">
                      Найти рестораны
                    </Button>
                  </div>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="space-y-4">
                      {/* Cuisine filters */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Кухня:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.values(CuisineType).map((cuisine) => (
                            <button
                              key={cuisine}
                              type="button"
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

                      {/* Price range filters */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Цена:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {Object.values(PriceRange).map((priceRange) => (
                            <button
                              key={priceRange}
                              type="button"
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
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showSearchResults ? (
          /* Search Results */
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Результаты поиска
                {filteredRestaurants.length > 0 && (
                  <span className="text-gray-500 ml-2">
                    ({filteredRestaurants.length})
                  </span>
                )}
              </h2>
            </div>

            {searchLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.$id}
                    restaurant={restaurant}
                    onBookClick={handleBookingClick}
                    onFavoriteClick={user ? handleFavoriteClick : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Рестораны не найдены
                </h3>
                <p className="text-gray-500 mb-4">
                  Попробуйте изменить критерии поиска
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Очистить фильтры
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Popular Restaurants */
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-indigo-600" />
                  Популярные рестораны
                </h2>
                <p className="text-gray-600 mt-1">
                  Рестораны с лучшими рейтингами и отзывами
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => router.push("/restaurants")}
              >
                Посмотреть все
              </Button>
            </div>

            {popularLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.$id}
                    restaurant={restaurant}
                    onBookClick={handleBookingClick}
                    onFavoriteClick={user ? handleFavoriteClick : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA Section */}
        {!user && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Присоединяйтесь к RestaurantBooking
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Создайте аккаунт, чтобы бронировать столики, добавлять рестораны в
              избранное и получать персональные рекомендации.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push("/register")}
                icon={Heart}
              >
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
        )}
      </div>
    </Layout>
  );
}
