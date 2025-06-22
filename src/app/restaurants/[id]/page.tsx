// src/app/restaurants/[id]/page.tsx

"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import BookingForm from "@/components/bookings/BookingForm";
import { useRestaurant, useRestaurantReviews } from "@/hooks/useRestaurants";
import { useAuth } from "@/hooks/useAuth";
import { useAppDataStore } from "@/store/appStore";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  Heart,
  Calendar,
  Users,
  Utensils,
  Wifi,
  Car,
  CreditCard,
  Share2,
} from "lucide-react";
import { getCuisineTypeLabel, getPriceRangeLabel, DayHours } from "@/types";

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const restaurantId = params.id as string;

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const {
    favoriteRestaurants,
    addFavoriteRestaurant,
    removeFavoriteRestaurant,
  } = useAppDataStore();

  const { data: restaurant, isLoading } = useRestaurant(restaurantId);
  const { data: reviews = [] } = useRestaurantReviews(restaurantId);

  const isFavorite = favoriteRestaurants.includes(restaurantId);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ресторан не найден
            </h1>
            <Button onClick={() => router.push("/")}>На главную</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleBookingClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setShowBookingModal(true);
  };

  const handleFavoriteClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (isFavorite) {
      removeFavoriteRestaurant(restaurantId);
    } else {
      addFavoriteRestaurant(restaurantId);
    }
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

  const formatWorkingHours = (hours: DayHours): string => {
    if (!hours.isOpen) return "Закрыто";
    return `${hours.openTime} - ${hours.closeTime}`;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
        return <Wifi className="h-4 w-4" />;
      case "парковка":
        return <Car className="h-4 w-4" />;
      case "карты":
        return <CreditCard className="h-4 w-4" />;
      default:
        return <Utensils className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-96 bg-gray-900">
          {restaurant.images.length > 0 && (
            <Image
              src={restaurant.images[selectedImageIndex]}
              alt={restaurant.name}
              fill
              className="object-cover opacity-80"
            />
          )}

          {/* Image Navigation */}
          {restaurant.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2">
                {restaurant.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === selectedImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Content Overlay */}
          <div className="absolute inset-0 bg-black/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end">
              <div className="pb-12 text-white">
                <div className="flex items-center space-x-3 mb-4">
                  <h1 className="text-4xl font-bold">{restaurant.name}</h1>
                  <Badge variant={isOpenNow() ? "success" : "error"}>
                    {isOpenNow() ? "Открыт" : "Закрыт"}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">
                      {restaurant.averageRating.toFixed(1)}
                    </span>
                    <span className="text-white/80 ml-2">
                      ({restaurant.totalReviews} отзывов)
                    </span>
                  </div>

                  <Badge variant="secondary">
                    {getPriceRangeLabel(restaurant.priceRange)}
                  </Badge>

                  <div className="text-white/80">
                    {restaurant.cuisineType.map(getCuisineTypeLabel).join(", ")}
                  </div>
                </div>

                <div className="flex items-center text-white/80">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>
                    {restaurant.address.street}, {restaurant.address.city}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-8">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={handleBookingClick} icon={Calendar}>
                  Забронировать столик
                </Button>

                {user && (
                  <Button
                    variant="outline"
                    onClick={handleFavoriteClick}
                    icon={Heart}
                    className={isFavorite ? "text-red-600 border-red-600" : ""}
                  >
                    {isFavorite ? "В избранном" : "В избранное"}
                  </Button>
                )}

                <Button variant="outline" icon={Share2}>
                  Поделиться
                </Button>
              </div>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>О ресторане</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {restaurant.description}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              {restaurant.amenities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Удобства</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {restaurant.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          {getAmenityIcon(amenity)}
                          <span className="text-gray-700">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Отзывы ({reviews.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.slice(0, 3).map((review) => (
                        <div
                          key={review.$id}
                          className="border-b border-gray-200 pb-6 last:border-b-0"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-medium text-gray-900">
                                  {review.rating}/5
                                </span>
                              </div>
                              {review.title && (
                                <h4 className="font-medium text-gray-900 mb-2">
                                  {review.title}
                                </h4>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.$createdAt).toLocaleDateString(
                                "ru-RU"
                              )}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}

                      {reviews.length > 3 && (
                        <Button variant="outline" fullWidth>
                          Показать все отзывы ({reviews.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Пока нет отзывов</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Станьте первым, кто оставит отзыв!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Контакты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <a
                      href={`tel:${restaurant.phone}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {restaurant.phone}
                    </a>
                  </div>

                  {restaurant.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        Веб-сайт
                      </a>
                    </div>
                  )}

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="text-gray-700">
                      <div>{restaurant.address.street}</div>
                      <div>
                        {restaurant.address.city}, {restaurant.address.state}
                      </div>
                      <div>{restaurant.address.zipCode}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Working Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Время работы
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(restaurant.workingHours).map(
                      ([day, hours]) => {
                        const dayLabels: Record<string, string> = {
                          monday: "Понедельник",
                          tuesday: "Вторник",
                          wednesday: "Среда",
                          thursday: "Четверг",
                          friday: "Пятница",
                          saturday: "Суббота",
                          sunday: "Воскресенье",
                        };

                        return (
                          <div key={day} className="flex justify-between">
                            <span className="font-medium text-gray-700">
                              {dayLabels[day]}
                            </span>
                            <span className="text-gray-600">
                              {formatWorkingHours(hours)}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Средняя вместимость</span>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      <span>2-8 человек</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Кухня</span>
                    <span className="text-gray-900">
                      {restaurant.cuisineType
                        .map(getCuisineTypeLabel)
                        .join(", ")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ценовая категория</span>
                    <span className="text-gray-900">
                      {getPriceRangeLabel(restaurant.priceRange)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        <Modal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          title={`Бронирование в ${restaurant.name}`}
          size="lg"
        >
          <BookingForm
            restaurant={restaurant}
            onSuccess={() => {
              setShowBookingModal(false);
              // Можно добавить редирект к списку бронирований
            }}
            onCancel={() => setShowBookingModal(false)}
          />
        </Modal>
      </div>
    </Layout>
  );
}
