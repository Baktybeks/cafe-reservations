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
} from "lucide-react";
import {
  Restaurant,
  getCuisineTypeLabel,
  getPriceRangeLabel,
  getRestaurantStatusLabel,
} from "@/types";
import { useAppDataStore } from "@/store/appStore";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onBookClick?: (restaurant: Restaurant) => void;
  onFavoriteClick?: (restaurant: Restaurant) => void;
  showStatus?: boolean;
  variant?: "default" | "compact" | "detailed";
}

export function RestaurantCard({
  restaurant,
  onBookClick,
  onFavoriteClick,
  showStatus = false,
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

  // Проверяем, открыт ли ресторан сейчас
  const isOpenNow = () => {
    const now = new Date();
    const currentDay =
      now.toLocaleLowerCase() as keyof typeof restaurant.workingHours;
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

  if (variant === "compact") {
    return (
      <Link href={`/restaurants/${restaurant.$id}`}>
        <Card hover className="h-full">
          <CardContent padding="sm">
            <div className="flex space-x-3">
              {/* Image */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                  {restaurant.images[0] && (
                    <Image
                      src={restaurant.images[0]}
                      alt={restaurant.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {restaurant.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {restaurant.cuisineType
                        .map(getCuisineTypeLabel)
                        .join(", ")}
                    </p>
                  </div>

                  {onFavoriteClick && (
                    <button
                      onClick={handleFavoriteClick}
                      className="ml-2 p-1 rounded-full hover:bg-gray-100"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          isFavorite
                            ? "text-red-500 fill-current"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  )}
                </div>

                <div className="flex items-center mt-2 space-x-2">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600 ml-1">
                      {restaurant.averageRating.toFixed(1)}
                    </span>
                  </div>

                  <Badge variant={isOpen ? "success" : "error"} size="sm">
                    {isOpen ? "Открыт" : "Закрыт"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/restaurants/${restaurant.$id}`}>
      <Card hover className="h-full">
        <CardContent padding="none">
          {/* Image */}
          <div className="relative h-48 bg-gray-200">
            {restaurant.images[0] && (
              <Image
                src={restaurant.images[0]}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            )}

            {/* Status badge */}
            {showStatus && (
              <div className="absolute top-3 left-3">
                <Badge
                  variant={
                    restaurant.status === "APPROVED"
                      ? "success"
                      : restaurant.status === "PENDING"
                      ? "warning"
                      : "error"
                  }
                >
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
            <div className="absolute bottom-3 left-3">
              <Badge variant={isOpen ? "success" : "error"} size="sm">
                {isOpen ? "Открыт" : "Закрыт"}
              </Badge>
            </div>
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
            {restaurant.amenities.length > 0 && (
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
            {onBookClick && (
              <Button
                fullWidth
                onClick={handleBookClick}
                icon={Calendar}
                size="sm"
              >
                Забронировать
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
