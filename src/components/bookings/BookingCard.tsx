// components/bookings/BookingCard.tsx

import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Booking,
  BookingStatus,
  getBookingStatusLabel,
  getBookingStatusColor,
} from "@/types";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Eye,
  X,
  Edit,
} from "lucide-react";

interface BookingCardProps {
  booking: Booking; // Теперь параметр booking имеет правильный тип
  variant?: "customer" | "restaurant" | "admin";
  onCancel?: (bookingId: string) => void;
  onView?: (bookingId: string) => void;
  onEdit?: (bookingId: string) => void;
  showActions?: boolean;
}

export function BookingCard({
  booking,
  variant = "customer",
  onCancel,
  onView,
  onEdit,
  showActions = true,
}: BookingCardProps) {
  const statusColor = getBookingStatusColor(booking.status);
  const canCancel =
    booking.status === BookingStatus.PENDING ||
    booking.status === BookingStatus.CONFIRMED;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          {/* Основная информация */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.restaurantName || "Ресторан"}
                  </h3>
                  <Badge variant={statusColor as any} size="sm">
                    {getBookingStatusLabel(booking.status)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 font-mono">
                  Код: {booking.confirmationCode}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(booking.date)}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{booking.time}</span>
              </div>

              <div className="flex items-center text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{booking.guestCount} гостей</span>
              </div>

              {variant === "restaurant" && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{booking.customerPhone}</span>
                </div>
              )}
            </div>

            {booking.specialRequests && (
              <div className="mt-3 p-2 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>Особые пожелания:</strong> {booking.specialRequests}
                </p>
              </div>
            )}
          </div>

          {/* Действия */}
          {showActions && (
            <div className="flex items-center space-x-2 mt-4 lg:mt-0 lg:ml-6">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Eye}
                  onClick={() => onView(booking.$id)}
                >
                  Просмотр
                </Button>
              )}

              {onEdit && variant === "restaurant" && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit}
                  onClick={() => onEdit(booking.$id)}
                >
                  Изменить
                </Button>
              )}

              {onCancel && canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  icon={X}
                  onClick={() => onCancel(booking.$id)}
                  className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                >
                  Отменить
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
