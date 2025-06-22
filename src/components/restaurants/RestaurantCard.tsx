// src/components/restaurants/RestaurantCard.tsx

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Heart,
  Calendar,
  Phone,
  Globe,
  Eye,
  Edit,
  UtensilsCrossed,
} from "lucide-react";
import {
  Restaurant,
  RestaurantStatus,
  getCuisineTypeLabel,
  getPriceRangeLabel,
} from "@/types";
import { useAppDataStore } from "@/store/appStore";

// Локальные функции для лейблов
const getRestaurantStatusLabel = (status: RestaurantStatus): string => {
  const labels = {
    [RestaurantStatus.PENDING]: "На модерации",
    [RestaurantStatus.APPROVED]: "Одобрен",
    [RestaurantStatus.REJECTED]: "Отклонен",
    [RestaurantStatus.SUSPENDED]: "Заблокирован",
  };
  return labels[status] || status;
};

interface RestaurantCardProps {
  restaurant: Restaurant;
  onBookClick?: (restaurant: Restaurant) => void;
  onFavoriteClick?: (restaurant: Restaurant) => void;
  onModerate?: (restaurant: Restaurant) => void;
  onEdit?: (restaurant: Restaurant) => void;
  onView?: (restaurant: Restaurant) => void;
  showStatus?: boolean;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
}

export function RestaurantCard({
  restaurant,
  onBookClick,
  onFavoriteClick,
  onModerate,
  onEdit,
  onView,
  showStatus = false,
  showActions = false,
  variant = "default",
}: RestaurantCardProps) {
  const { favoriteRestaurants } = useAppDataStore();
  const isFavorite = favoriteRestaurants.includes(restaurant.$id);

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookClick?.(restaurant);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteClick?.(restaurant);
  };

  const handleModerateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Клик на модерацию:", restaurant.name, restaurant.status);
    onModerate?.(restaurant);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Клик на просмотр:", restaurant.name, restaurant.status);
    onView?.(restaurant);
  };

  // Проверяем, открыт ли ресторан сейчас
  const isOpenNow = () => {
    const now = new Date();
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const currentDay = days[
      now.getDay()
    ] as keyof typeof restaurant.workingHours;

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

  const isOpen = isOpenNow();

  const getStatusVariant = (status: RestaurantStatus) => {
    switch (status) {
      case RestaurantStatus.APPROVED:
        return "success";
      case RestaurantStatus.PENDING:
        return "warning";
      case RestaurantStatus.REJECTED:
        return "error";
      case RestaurantStatus.SUSPENDED:
        return "error";
      default:
        return "default";
    }
  };

  // Определяем, нужно ли показывать кнопку модерации
  const needsModeration =
    restaurant.status === RestaurantStatus.PENDING ||
    restaurant.status === RestaurantStatus.REJECTED ||
    restaurant.status === RestaurantStatus.APPROVED ||
    restaurant.status === RestaurantStatus.SUSPENDED;

  if (variant === "compact") {
    return (
      <Card hover className="h-full">
        <CardContent padding="sm">
          <div className="flex space-x-3">
            {/* Image */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                {restaurant.images && restaurant.images[0] ? (
                  <Image
                    src={restaurant.images[0]}
                    alt={restaurant.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <UtensilsCrossed className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {restaurant.cuisineType.map(getCuisineTypeLabel).join(", ")}
                  </p>
                </div>

                {showStatus && (
                  <Badge
                    variant={getStatusVariant(restaurant.status)}
                    size="sm"
                  >
                    {getRestaurantStatusLabel(restaurant.status)}
                  </Badge>
                )}
              </div>

              <div className="flex items-center mt-2 space-x-2">
                {restaurant.averageRating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600 ml-1">
                      {restaurant.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}

                <Badge variant={isOpen ? "success" : "error"} size="sm">
                  {isOpen ? "Открыт" : "Закрыт"}
                </Badge>
              </div>

              {/* Кнопка модерации для всех статусов, требующих внимания */}
              {needsModeration && onModerate ? (
                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={handleModerateClick}
                    icon={Eye}
                    className={`${
                      restaurant.status === RestaurantStatus.PENDING
                        ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                        : restaurant.status === RestaurantStatus.REJECTED
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-orange-600 hover:bg-orange-700 text-white"
                    }`}
                    fullWidth
                  >
                    {restaurant.status === RestaurantStatus.PENDING
                      ? "Модерировать"
                      : restaurant.status === RestaurantStatus.REJECTED
                      ? "Пересмотреть"
                      : "Управлять"}
                  </Button>
                </div>
              ) : onView ? (
                <div className="mt-3">
                  <Button
                    size="sm"
                    onClick={handleViewClick}
                    icon={Eye}
                    variant="outline"
                    fullWidth
                  >
                    Подробнее
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card hover className="h-full">
      <CardContent padding="none">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {restaurant.images && restaurant.images[0] ? (
            <Image
              src={restaurant.images[0]}
              alt={restaurant.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <UtensilsCrossed className="h-16 w-16" />
            </div>
          )}

          {/* Status badge */}
          {showStatus && (
            <div className="absolute top-3 left-3">
              <Badge variant={getStatusVariant(restaurant.status)}>
                {getRestaurantStatusLabel(restaurant.status)}
              </Badge>
            </div>
          )}

          {/* Favorite button */}
          {onFavoriteClick && (
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
            >
              <Heart
                className={`h-5 w-5 ${
                  isFavorite ? "text-red-500 fill-current" : "text-gray-400"
                }`}
              />
            </button>
          )}

          {/* Open/Closed badge */}
          {!showStatus && (
            <div className="absolute bottom-3 left-3">
              <Badge variant={isOpen ? "success" : "error"} size="sm">
                {isOpen ? "Открыт" : "Закрыт"}
              </Badge>
            </div>
          )}

          {/* Индикатор срочности для ресторанов, требующих внимания */}
          {needsModeration && (
            <div className="absolute bottom-3 right-3">
              <div
                className={`w-6 h-6 rounded-full animate-pulse flex items-center justify-center ${
                  restaurant.status === RestaurantStatus.PENDING
                    ? "bg-yellow-500"
                    : restaurant.status === RestaurantStatus.REJECTED
                    ? "bg-red-500"
                    : "bg-orange-500"
                }`}
              >
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {restaurant.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {restaurant.cuisineType.map(getCuisineTypeLabel).join(", ")}
              </p>
            </div>

            <div className="ml-3">
              <Badge variant="secondary" size="sm">
                {getPriceRangeLabel(restaurant.priceRange)}
              </Badge>
            </div>
          </div>

          {/* Rating and reviews */}
          {restaurant.averageRating > 0 && (
            <div className="flex items-center mb-3">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900 ml-1">
                  {restaurant.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500 ml-2">
                ({restaurant.totalReviews} отзывов)
              </span>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">
              {restaurant.address.city}, {restaurant.address.street}
            </span>
          </div>

          {/* Contact info */}
          {variant === "detailed" && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{restaurant.phone}</span>
              </div>
              {restaurant.website && (
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Веб-сайт
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Amenities */}
          {restaurant.amenities && restaurant.amenities.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {restaurant.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {amenity}
                  </Badge>
                ))}
                {restaurant.amenities.length > 3 && (
                  <Badge variant="secondary" size="sm">
                    +{restaurant.amenities.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {/* Основная кнопка действия */}
            {restaurant.status === RestaurantStatus.APPROVED && onBookClick ? (
              <Button
                fullWidth
                onClick={handleBookClick}
                icon={Calendar}
                size="sm"
              >
                Забронировать
              </Button>
            ) : needsModeration && onModerate ? (
              <Button
                fullWidth
                onClick={handleModerateClick}
                icon={Eye}
                size="sm"
                className={`${
                  restaurant.status === RestaurantStatus.PENDING
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : restaurant.status === RestaurantStatus.REJECTED
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`}
              >
                {restaurant.status === RestaurantStatus.PENDING
                  ? "🔍 Модерировать"
                  : restaurant.status === RestaurantStatus.REJECTED ||
                    restaurant.status === RestaurantStatus.APPROVED
                  ? "🔄 Пересмотреть"
                  : "⚙️ Управлять"}
              </Button>
            ) : restaurant.status === RestaurantStatus.APPROVED ? (
              <Link href={`/restaurants/${restaurant.$id}`}>
                <Button fullWidth icon={Eye} size="sm" variant="outline">
                  Посмотреть
                </Button>
              </Link>
            ) : onView ? (
              <Button
                fullWidth
                onClick={handleViewClick}
                icon={Eye}
                size="sm"
                variant="outline"
              >
                Подробнее
              </Button>
            ) : (
              <Button
                fullWidth
                onClick={() => console.log("Нет доступных действий")}
                icon={Eye}
                size="sm"
                variant="outline"
                disabled
              >
                Подробнее
              </Button>
            )}

            {/* Дополнительные действия */}
            {showActions && (
              <div className="flex space-x-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit(restaurant);
                    }}
                    icon={Edit}
                    className="flex-1"
                  >
                    Редактировать
                  </Button>
                )}
              </div>
            )}

            {/* Отладочная информация для разработки */}
            {process.env.NODE_ENV === "development" && (
              <div className="text-xs text-gray-500 border-t pt-2">
                <strong>Debug:</strong> Статус: {restaurant.status} | Нужна
                модерация: {needsModeration ? "Да" : "Нет"} | onModerate:{" "}
                {onModerate ? "Есть" : "Нет"} | onView:{" "}
                {onView ? "Есть" : "Нет"}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
