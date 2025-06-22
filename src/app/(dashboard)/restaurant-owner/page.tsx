// src/app/(dashboard)/restaurant-owner/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { BookingCard } from "@/components/bookings/BookingCard";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerRestaurants } from "@/hooks/useRestaurants";
import { useBookings } from "@/hooks/useBookings";
import { useUpdateBookingStatus } from "@/hooks/useBookings";
import {
  UtensilsCrossed,
  Calendar,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Eye,
  Users,
  DollarSign,
} from "lucide-react";
import { UserRole, BookingStatus, RestaurantStatus } from "@/types";

export default function RestaurantOwnerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "restaurants" | "bookings" | "analytics"
  >("overview");

  const updateBookingStatus = useUpdateBookingStatus();

  // Получаем данные владельца
  const { data: ownerRestaurants = [], isLoading: restaurantsLoading } =
    useOwnerRestaurants(user?.$id || "");

  // Получаем все бронирования для ресторанов владельца
  const restaurantIds = ownerRestaurants.map((r) => r.$id);
  const { data: allBookings = [], isLoading: bookingsLoading } = useBookings({
    restaurantId: restaurantIds.length > 0 ? restaurantIds[0] : undefined, // Упрощение для демо
  });

  // Проверяем права доступа
  if (
    !user ||
    ![UserRole.RESTAURANT_OWNER, UserRole.ADMIN].includes(user.role)
  ) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <UtensilsCrossed className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-amber-600 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              У вас нет прав для доступа к панели владельца ресторана.
            </p>
            <Button onClick={() => router.push("/")}>На главную</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Статистика
  const stats = {
    totalRestaurants: ownerRestaurants.length,
    approvedRestaurants: ownerRestaurants.filter(
      (r) => r.status === RestaurantStatus.APPROVED
    ).length,
    pendingRestaurants: ownerRestaurants.filter(
      (r) => r.status === RestaurantStatus.PENDING
    ).length,
    totalBookings: allBookings.length,
    pendingBookings: allBookings.filter(
      (b) => b.status === BookingStatus.PENDING
    ).length,
    confirmedBookings: allBookings.filter(
      (b) => b.status === BookingStatus.CONFIRMED
    ).length,
    todayBookings: allBookings.filter(
      (b) => b.date === new Date().toISOString().split("T")[0]
    ).length,
    monthlyRevenue: 0, // Подсчет реального дохода можно добавить позже
  };

  const pendingBookings = allBookings.filter(
    (b) => b.status === BookingStatus.PENDING
  );
  const todayBookings = allBookings.filter(
    (b) => b.date === new Date().toISOString().split("T")[0]
  );

  const handleBookingStatusChange = async (
    bookingId: string,
    status: BookingStatus
  ) => {
    await updateBookingStatus.mutateAsync({ bookingId, status });
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
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <UtensilsCrossed className="h-6 w-6 mr-3 text-amber-600" />
                    Панель владельца ресторана
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Добро пожаловать, {user.name}! Управляйте своими ресторанами
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() =>
                      router.push("/restaurant-owner/restaurants/new")
                    }
                  >
                    Добавить ресторан
                  </Button>
                  <Button
                    variant="outline"
                    icon={Settings}
                    onClick={() => router.push("/restaurant-owner/settings")}
                  >
                    Настройки
                  </Button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-6">
                <nav className="flex space-x-8">
                  {[
                    { id: "overview", label: "Обзор", icon: BarChart3 },
                    {
                      id: "restaurants",
                      label: "Мои рестораны",
                      icon: UtensilsCrossed,
                      badge: stats.totalRestaurants,
                    },
                    {
                      id: "bookings",
                      label: "Бронирования",
                      icon: Calendar,
                      badge: stats.pendingBookings,
                    },
                    { id: "analytics", label: "Аналитика", icon: TrendingUp },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                          isActive
                            ? "border-amber-500 text-amber-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                        {tab.badge && tab.badge > 0 && (
                          <Badge
                            variant={
                              tab.id === "bookings" && stats.pendingBookings > 0
                                ? "warning"
                                : "info"
                            }
                            size="sm"
                            className="ml-2"
                          >
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
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent padding="md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <UtensilsCrossed className="h-8 w-8 text-amber-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Мои рестораны
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats.totalRestaurants}
                        </p>
                        <p className="text-xs text-gray-500">
                          {stats.approvedRestaurants} активных
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent padding="md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Calendar className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Бронирования
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats.totalBookings}
                        </p>
                        <p className="text-xs text-gray-500">
                          {stats.todayBookings} сегодня
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent padding="md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Ожидают ответа
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats.pendingBookings}
                        </p>
                        <p className="text-xs text-gray-500">
                          требуют внимания
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent padding="md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Загрузка
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {Math.round(
                            (stats.confirmedBookings /
                              Math.max(stats.totalBookings, 1)) *
                              100
                          )}
                          %
                        </p>
                        <p className="text-xs text-gray-500">подтверждённых</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              {stats.totalRestaurants === 0 && (
                <Card>
                  <CardContent>
                    <div className="text-center py-12">
                      <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Добро пожаловать в систему!
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Начните с добавления вашего первого ресторана
                      </p>
                      <Button
                        size="lg"
                        icon={Plus}
                        onClick={() =>
                          router.push("/restaurant-owner/restaurants/new")
                        }
                      >
                        Добавить ресторан
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Alerts */}
              {(stats.pendingBookings > 0 || stats.pendingRestaurants > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      Требует внимания
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.pendingBookings > 0 && (
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-yellow-600 mr-2" />
                            <span className="text-sm text-yellow-800">
                              {stats.pendingBookings} новых бронирований ждут
                              подтверждения
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab("bookings")}
                          >
                            Обработать
                          </Button>
                        </div>
                      )}
                      {stats.pendingRestaurants > 0 && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <UtensilsCrossed className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-blue-800">
                              {stats.pendingRestaurants} ресторанов на модерации
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab("restaurants")}
                          >
                            Проверить
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Today's Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Новые бронирования</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 h-20 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : pendingBookings.length > 0 ? (
                      <div className="space-y-4">
                        {pendingBookings.slice(0, 3).map((booking) => (
                          <BookingCard
                            key={booking.$id}
                            booking={booking}
                            variant="restaurant"
                            onStatusChange={handleBookingStatusChange}
                          />
                        ))}
                        {pendingBookings.length > 3 && (
                          <Button
                            variant="outline"
                            fullWidth
                            onClick={() => setActiveTab("bookings")}
                          >
                            Показать все ({pendingBookings.length})
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-gray-500">Нет новых бронирований</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Today's Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Сегодняшние бронирования</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 h-20 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : todayBookings.length > 0 ? (
                      <div className="space-y-4">
                        {todayBookings.slice(0, 5).map((booking) => (
                          <div
                            key={booking.$id}
                            className="p-3 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {booking.customerName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {booking.timeSlot} • {booking.partySize}{" "}
                                  человек
                                </p>
                              </div>
                              <Badge
                                variant={
                                  booking.status === BookingStatus.CONFIRMED
                                    ? "success"
                                    : booking.status === BookingStatus.PENDING
                                    ? "warning"
                                    : "error"
                                }
                              >
                                {booking.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">
                          Нет бронирований на сегодня
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "restaurants" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Мои рестораны
                </h2>
                <Button
                  icon={Plus}
                  onClick={() =>
                    router.push("/restaurant-owner/restaurants/new")
                  }
                >
                  Добавить ресторан
                </Button>
              </div>

              {restaurantsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-64 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : ownerRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownerRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.$id}
                      restaurant={restaurant}
                      showStatus
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent>
                    <div className="text-center py-12">
                      <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        У вас пока нет ресторанов
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Добавьте свой первый ресторан и начните принимать
                        бронирования
                      </p>
                      <Button
                        icon={Plus}
                        onClick={() =>
                          router.push("/restaurant-owner/restaurants/new")
                        }
                      >
                        Добавить ресторан
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Управление бронированиями
                </h2>
              </div>

              {bookingsLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-32 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : allBookings.length > 0 ? (
                <div className="space-y-4">
                  {allBookings.map((booking) => (
                    <BookingCard
                      key={booking.$id}
                      booking={booking}
                      variant="restaurant"
                      onStatusChange={handleBookingStatusChange}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent>
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Нет бронирований
                      </h3>
                      <p className="text-gray-500">
                        Когда клиенты начнут бронировать столики, они появятся
                        здесь
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Аналитика и отчеты
                </h2>
              </div>

              <Card>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Аналитика в разработке
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Скоро здесь будут графики посещаемости, доходы и детальная
                      статистика
                    </p>
                    <Button variant="outline">Скоро появится</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
