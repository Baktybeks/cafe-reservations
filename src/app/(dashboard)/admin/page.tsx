// src/app/(dashboard)/admin/page.tsx

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
import { useRestaurants } from "@/hooks/useRestaurants";
import { useBookings } from "@/hooks/useBookings";
import {
  Users,
  UtensilsCrossed,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Settings,
  Shield,
  Eye,
} from "lucide-react";
import { UserRole, RestaurantStatus, BookingStatus } from "@/types";

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "restaurants" | "bookings" | "users"
  >("overview");

  // Получаем данные
  const { data: allRestaurants = [], isLoading: restaurantsLoading } =
    useRestaurants();
  const { data: allBookings = [], isLoading: bookingsLoading } = useBookings();

  // Проверяем права доступа
  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              У вас нет прав для доступа к админ панели.
            </p>
            <Button onClick={() => router.push("/")}>На главную</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Статистика
  const stats = {
    totalRestaurants: allRestaurants.length,
    pendingRestaurants: allRestaurants.filter(
      (r) => r.status === RestaurantStatus.PENDING
    ).length,
    approvedRestaurants: allRestaurants.filter(
      (r) => r.status === RestaurantStatus.APPROVED
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
  };

  const pendingRestaurants = allRestaurants.filter(
    (r) => r.status === RestaurantStatus.PENDING
  );
  const recentBookings = allBookings.slice(0, 5);

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
                    <Shield className="h-6 w-6 mr-3 text-red-600" />
                    Панель администратора
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Добро пожаловать, {user.name}! Управление системой
                    бронирования
                  </p>
                </div>
                <Button
                  variant="outline"
                  icon={Settings}
                  onClick={() => router.push("/admin/settings")}
                >
                  Настройки
                </Button>
              </div>

              {/* Navigation Tabs */}
              <div className="mt-6">
                <nav className="flex space-x-8">
                  {[
                    { id: "overview", label: "Обзор", icon: BarChart3 },
                    {
                      id: "restaurants",
                      label: "Рестораны",
                      icon: UtensilsCrossed,
                      badge: stats.pendingRestaurants,
                    },
                    {
                      id: "bookings",
                      label: "Бронирования",
                      icon: Calendar,
                      badge: stats.pendingBookings,
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
                            ? "border-indigo-500 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-2" />

                        <div className="mr-2">{tab.label}</div>
                        {tab.badge && tab.badge > 0 && (
                          <Badge variant="error" size="sm" className="ml-2">
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
                        <UtensilsCrossed className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Всего ресторанов
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats.totalRestaurants}
                        </p>
                        <p className="text-xs text-gray-500">
                          {stats.pendingRestaurants} на модерации
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent padding="md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Calendar className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Всего бронирований
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
                          Ожидают подтверждения
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stats.pendingBookings}
                        </p>
                        <p className="text-xs text-gray-500">бронирований</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent padding="md">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Активность
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

              {/* Alerts */}
              {(stats.pendingRestaurants > 0 || stats.pendingBookings > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      Требует внимания
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.pendingRestaurants > 0 && (
                        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                          <div className="flex items-center">
                            <UtensilsCrossed className="h-4 w-4 text-amber-600 mr-2" />
                            <span className="text-sm text-amber-800">
                              {stats.pendingRestaurants} ресторанов ожидают
                              модерации
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
                      {stats.pendingBookings > 0 && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm text-blue-800">
                              {stats.pendingBookings} бронирований требуют
                              внимания
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab("bookings")}
                          >
                            Просмотреть
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Restaurants */}
                <Card>
                  <CardHeader>
                    <CardTitle>Рестораны на модерации</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {restaurantsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 h-20 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : pendingRestaurants.length > 0 ? (
                      <div className="space-y-4">
                        {pendingRestaurants.slice(0, 3).map((restaurant) => (
                          <RestaurantCard
                            key={restaurant.$id}
                            restaurant={restaurant}
                            variant="compact"
                            showStatus
                          />
                        ))}
                        {pendingRestaurants.length > 3 && (
                          <Button
                            variant="outline"
                            fullWidth
                            onClick={() => setActiveTab("restaurants")}
                          >
                            Показать все ({pendingRestaurants.length})
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <p className="text-gray-500">
                          Нет ресторанов на модерации
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Последние бронирования</CardTitle>
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
                    ) : recentBookings.length > 0 ? (
                      <div className="space-y-4">
                        {recentBookings.map((booking) => (
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
                                  {booking.date} в {booking.timeSlot}
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
                        <Button
                          variant="outline"
                          fullWidth
                          onClick={() => setActiveTab("bookings")}
                        >
                          Показать все бронирования
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Нет бронирований</p>
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
                  Управление ресторанами
                </h2>
                <div className="flex space-x-3">
                  <Button variant="outline" icon={Eye}>
                    Все рестораны
                  </Button>
                </div>
              </div>

              {restaurantsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-64 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.$id}
                      restaurant={restaurant}
                      showStatus
                    />
                  ))}
                </div>
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
              ) : (
                <div className="space-y-4">
                  {allBookings.map((booking) => (
                    <BookingCard
                      key={booking.$id}
                      booking={booking}
                      variant="admin"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
