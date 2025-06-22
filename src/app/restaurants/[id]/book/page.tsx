// src/app/restaurants/[id]/book/page.tsx

"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import BookingForm from "@/components/bookings/BookingForm";
import { useRestaurant } from "@/hooks/useRestaurants";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Star,
  Calendar,
  Users,
  CheckCircle,
} from "lucide-react";
import { getCuisineTypeLabel, getPriceRangeLabel } from "@/types";

export default function RestaurantBookingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const restaurantId = params.id as string;

  const [bookingComplete, setBookingComplete] = useState(false);

  const { data: restaurant, isLoading: restaurantLoading } =
    useRestaurant(restaurantId);

  // ИСПРАВЛЕНО: Показываем загрузку пока проверяем авторизацию или загружаем ресторан
  if (authLoading || restaurantLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  // ИСПРАВЛЕНО: Проверяем ресторан перед проверкой авторизации
  if (!restaurant) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ресторан не найден
                </h3>
                <p className="text-gray-500 mb-6">
                  Запрашиваемый ресторан не существует или недоступен
                </p>
                <Button onClick={() => router.push("/restaurants")}>
                  К списку ресторанов
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // ИСПРАВЛЕНО: Проверяем авторизацию только после загрузки данных
  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Требуется авторизация
                </h3>
                <p className="text-gray-500 mb-6">
                  Войдите в систему, чтобы забронировать столик в ресторане "
                  {restaurant.name}"
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() =>
                      router.push(
                        `/login?redirect=/restaurants/${restaurantId}/book`
                      )
                    }
                    className="flex-1"
                  >
                    Войти
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/register?redirect=/restaurants/${restaurantId}/book`
                      )
                    }
                    className="flex-1"
                  >
                    Регистрация
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleBookingSuccess = () => {
    setBookingComplete(true);
  };

  const isOpenNow = () => {
    const now = new Date();

    const currentDay = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as keyof typeof restaurant.workingHours;

    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = restaurant.workingHours[currentDay];
    if (!todayHours?.isOpen || !todayHours.openTime || !todayHours.closeTime) {
      return false;
    }

    const [openHour, openMin] = todayHours.openTime.split(":").map(Number);
    const [closeHour, closeMin] = todayHours.closeTime.split(":").map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
  };

  if (bookingComplete) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Бронирование создано!
                </h3>
                <p className="text-gray-500 mb-6">
                  Ваше бронирование в ресторане "{restaurant.name}" успешно
                  создано. Подробности отправлены на ваш email.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => router.push("/customer/bookings")}
                    className="flex-1"
                  >
                    Мои бронирования
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/restaurants")}
                    className="flex-1"
                  >
                    Найти еще
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  icon={ArrowLeft}
                >
                  Назад
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Бронирование столика
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Выберите дату, время и количество гостей
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Детали бронирования
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BookingForm
                    restaurant={restaurant}
                    onSuccess={handleBookingSuccess}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Restaurant Info Sidebar */}
            <div className="space-y-6">
              {/* Restaurant Summary */}
              <Card>
                <CardContent className="p-0">
                  {restaurant.images[0] && (
                    <img
                      src={restaurant.images[0]}
                      alt={restaurant.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {restaurant.name}
                      </h3>
                      <Badge
                        variant={isOpenNow() ? "success" : "error"}
                        size="sm"
                      >
                        {isOpenNow() ? "Открыт" : "Закрыт"}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="secondary" size="sm">
                        {getPriceRangeLabel(restaurant.priceRange)}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {restaurant.cuisineType
                        .map(getCuisineTypeLabel)
                        .join(", ")}
                    </p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {restaurant.address.street}, {restaurant.address.city}
                        </span>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{restaurant.phone}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Правила бронирования
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">
                      Время бронирования:
                    </span>
                    <p className="text-gray-600 mt-1">
                      Столик бронируется на 2 часа. При необходимости продления,
                      обратитесь к администратору ресторана.
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-900">
                      Подтверждение:
                    </span>
                    <p className="text-gray-600 mt-1">
                      {restaurant.bookingSettings.autoConfirmBookings
                        ? "Бронирование подтверждается автоматически"
                        : "Ресторан подтвердит бронирование в течение 1 часа"}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-900">Отмена:</span>
                    <p className="text-gray-600 mt-1">
                      {restaurant.bookingSettings.cancellationPolicy}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium text-gray-900">
                      Максимальная группа:
                    </span>
                    <p className="text-gray-600 mt-1">
                      До {restaurant.bookingSettings.maxPartySize} человек
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Нужна помощь?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-gray-600">
                    Если у вас есть особые пожелания или вопросы, свяжитесь с
                    рестораном напрямую:
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        {restaurant.phone}
                      </a>
                    </div>

                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a
                        href={`mailto:${restaurant.email}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        {restaurant.email}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Время работы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {Object.entries(restaurant.workingHours).map(
                    ([day, hours]) => {
                      const dayLabels: Record<string, string> = {
                        monday: "Пн",
                        tuesday: "Вт",
                        wednesday: "Ср",
                        thursday: "Чт",
                        friday: "Пт",
                        saturday: "Сб",
                        sunday: "Вс",
                      };

                      const today = new Date()
                        .toLocaleDateString("en-US", { weekday: "long" })
                        .toLowerCase();
                      const isToday = day === today;

                      return (
                        <div
                          key={day}
                          className={`flex justify-between ${
                            isToday ? "font-medium" : ""
                          }`}
                        >
                          <span
                            className={
                              isToday ? "text-indigo-600" : "text-gray-600"
                            }
                          >
                            {dayLabels[day]}
                          </span>
                          <span
                            className={
                              isToday ? "text-indigo-600" : "text-gray-900"
                            }
                          >
                            {hours.isOpen
                              ? `${hours.openTime} - ${hours.closeTime}`
                              : "Закрыто"}
                          </span>
                        </div>
                      );
                    }
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
