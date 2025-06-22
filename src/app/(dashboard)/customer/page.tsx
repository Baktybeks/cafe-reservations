// src/app/(dashboard)/customer/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { BookingCard } from "@/components/bookings/BookingCard";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurants, usePopularRestaurants } from "@/hooks/useRestaurants";
import { useUserBookings, useUpcomingBookings } from "@/hooks/useBookings";
import { useAppDataStore } from "@/store/appStore";
import {
  Search,
  Calendar,
  Heart,
  MapPin,
  Star,
  Clock,
  UtensilsCrossed,
  TrendingUp,
  Filter,
  Eye,
  User,
} from "lucide-react";
import {
  UserRole,
  CuisineType,
  PriceRange,
  getCuisineTypeLabel,
  getPriceRangeLabel,
} from "@/types";

export default function CustomerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    favoriteRestaurants,
    addFavoriteRestaurant,
    removeFavoriteRestaurant,
  } = useAppDataStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<CuisineType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "discover" | "bookings" | "favorites"
  >("discover");

  // Получаем данные
  const { data: userBookings = [], isLoading: bookingsLoading } =
    useUserBookings(user?.$id || "");
  const { data: upcomingBookings = [], isLoading: upcomingLoading } =
    useUpcomingBookings(user?.$id || "");
  const { data: popularRestaurants = [], isLoading: popularLoading } =
    usePopularRestaurants(6);

  // Поиск ресторанов
  const { data: searchResults = [], isLoading: searchLoading } = useRestaurants(
    {
      searchQuery: searchQuery.trim(),
      city: selectedCity,
      cuisineType: selectedCuisines.length > 0 ? selectedCuisines : undefined,
    }
  );

  // Проверяем права доступа
  if (!user || ![UserRole.CUSTOMER, UserRole.ADMIN].includes(user.role)) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <User className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-blue-600 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              У вас нет прав для доступа к панели клиента.
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

  const hasActiveFilters =
    searchQuery || selectedCity || selectedCuisines.length > 0;
  const showSearchResults = hasActiveFilters;

  // Статистика пользователя
  const stats = {
    totalBookings: userBookings.length,
    upcomingBookings: upcomingBookings.length,
    favoriteRestaurants: favoriteRestaurants.length,
    completedBookings: userBookings.filter((b) => b.status === "COMPLETED")
      .length,
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Добро пожаловать, {user.name}!
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Находите лучшие рестораны и бронируйте столики
                  </p>
                </div>

                {upcomingBookings.length > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Ближайшее бронирование:
                    </p>
                    <p className="font-medium text-gray-900">
                      {upcomingBookings[0].date} в{" "}
                      {upcomingBookings[0].timeSlot}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="mt-6">
                <nav className="flex space-x-8">
                  {[
                    { id: "discover", label: "Поиск ресторанов", icon: Search },
                    {
                      id: "bookings",
                      label: "Мои бронирования",
                      icon: Calendar,
                      badge: stats.upcomingBookings,
                    },
                    {
                      id: "favorites",
                      label: "Избранное",
                      icon: Heart,
                      badge: stats.favoriteRestaurants,
                    },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                          isActive
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        <div className="mr-2">{tab.label}</div>
                        {tab.badge && tab.badge > 0 && (
                          <Badge variant="info" size="sm" className="ml-2">
                            {tab.badge}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === "discover" && (
            <div className="space-y-8">
              {/* Search Section */}
              <Card>
                <CardContent padding="lg">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Название ресторана, кухня..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={Search}
                      />
                      <Input
                        placeholder="Город"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        icon={MapPin}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        icon={Filter}
                      >
                        Фильтры
                        {selectedCuisines.length > 0 && (
                          <Badge variant="info" size="sm" className="ml-2">
                            {selectedCuisines.length}
                          </Badge>
                        )}
                      </Button>

                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCity("");
                            setSelectedCuisines([]);
                          }}
                        >
                          Очистить
                        </Button>
                      )}
                    </div>

                    {/* Filters */}
                    {showFilters && (
                      <div className="pt-4 border-t border-gray-200">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Тип кухни:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.values(CuisineType).map((cuisine) => (
                              <button
                                key={cuisine}
                                onClick={() => toggleCuisine(cuisine)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  selectedCuisines.includes(cuisine)
                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                    : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                                }`}
                              >
                                {getCuisineTypeLabel(cuisine)}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent padding="sm">
                    <div className="text-center">
                      <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-lg font-semibold text-gray-900">
                        {stats.totalBookings}
                      </p>
                      <p className="text-xs text-gray-600">
                        Всего бронирований
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent padding="sm">
                    <div className="text-center">
                      <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-lg font-semibold text-gray-900">
                        {stats.upcomingBookings}
                      </p>
                      <p className="text-xs text-gray-600">Предстоящих</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent padding="sm">
                    <div className="text-center">
                      <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <p className="text-lg font-semibold text-gray-900">
                        {stats.favoriteRestaurants}
                      </p>
                      <p className="text-xs text-gray-600">В избранном</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent padding="sm">
                    <div className="text-center">
                      <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <p className="text-lg font-semibold text-gray-900">
                        {stats.completedBookings}
                      </p>
                      <p className="text-xs text-gray-600">Завершённых</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div>
                {showSearchResults ? (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Результаты поиска
                      {searchResults.length > 0 && (
                        <span className="text-gray-500 ml-2">
                          ({searchResults.length})
                        </span>
                      )}
                    </h2>

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
                    ) : searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((restaurant) => (
                          <RestaurantCard
                            key={restaurant.$id}
                            restaurant={restaurant}
                            onBookClick={handleBookingClick}
                            onFavoriteClick={handleFavoriteClick}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Рестораны не найдены
                        </h3>
                        <p className="text-gray-500">
                          Попробуйте изменить критерии поиска
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      Популярные рестораны
                    </h2>

                    {popularLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                            <div className="bg-gray-200 h-4 rounded mb-2"></div>
                            <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {popularRestaurants.map((restaurant) => (
                          <RestaurantCard
                            key={restaurant.$id}
                            restaurant={restaurant}
                            onBookClick={handleBookingClick}
                            onFavoriteClick={handleFavoriteClick}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Мои бронирования
                </h2>
                <Button
                  variant="outline"
                  icon={Search}
                  onClick={() => setActiveTab("discover")}
                >
                  Найти ресторан
                </Button>
              </div>

              {bookingsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-32 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : userBookings.length > 0 ? (
                <div className="space-y-4">
                  {userBookings.map((booking) => (
                    <BookingCard
                      key={booking.$id}
                      booking={booking}
                      variant="customer"
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        У вас пока нет бронирований
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Найдите ресторан и забронируйте столик
                      </p>
                      <Button
                        icon={Search}
                        onClick={() => setActiveTab("discover")}
                      >
                        Найти ресторан
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "favorites" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Избранные рестораны
                </h2>
                <Button
                  variant="outline"
                  icon={Search}
                  onClick={() => setActiveTab("discover")}
                >
                  Найти ещё
                </Button>
              </div>

              {favoriteRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Здесь будут отображаться избранные рестораны */}
                  <Card>
                    <CardContent>
                      <div className="text-center py-12">
                        <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Загрузка избранных ресторанов
                        </h3>
                        <p className="text-gray-500">Функционал в разработке</p>
                      </div>
                    </CardContent>
                  </Card>
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
                        Добавляйте рестораны в избранное, чтобы быстро находить
                        их
                      </p>
                      <Button
                        icon={Search}
                        onClick={() => setActiveTab("discover")}
                      >
                        Найти ресторан
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
