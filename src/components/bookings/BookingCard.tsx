// src/components/bookings/BookingCard.tsx

"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Booking, BookingStatus, getBookingStatusLabel } from "@/types";

interface BookingCardProps {
  booking: Booking;
  restaurantName?: string;
  onStatusChange?: (bookingId: string, status: BookingStatus) => void;
  onCancel?: (bookingId: string) => void;
  onView?: (booking: Booking) => void;
  showActions?: boolean;
  variant?: "customer" | "restaurant" | "admin";
}

export function BookingCard({
  booking,
  restaurantName,
  onStatusChange,
  onCancel,
  onView,
  showActions = true,
  variant = "customer",
}: BookingCardProps) {
  const getStatusVariant = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return "success";
      case BookingStatus.PENDING:
        return "warning";
      case BookingStatus.CANCELLED:
      case BookingStatus.NO_SHOW:
        return "error";
      case BookingStatus.COMPLETED:
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const isUpcoming = () => {
    const bookingDateTime = new Date(`${booking.date}T${booking.timeSlot}`);
    return bookingDateTime > new Date();
  };

  const canCancel = () => {
    return (
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.CONFIRMED
    );
  };

  const canConfirm = () => {
    return booking.status === BookingStatus.PENDING && variant === "restaurant";
  };

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {variant === "customer" ? restaurantName : booking.customerName}
              </h3>
              <Badge variant={getStatusVariant(booking.status)}>
                {getBookingStatusLabel(booking.status)}
              </Badge>
            </div>

            <p className="text-sm text-gray-600">
              Код бронирования:{" "}
              <span className="font-medium">{booking.confirmationCode}</span>
            </p>
          </div>

          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(booking)}
              icon={Eye}
            >
              Подробности
            </Button>
          )}
        </div>

        {/* Booking details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Date and time */}
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(booking.date)}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{formatTime(booking.timeSlot)}</span>
              <span className="ml-2 text-gray-500">
                ({booking.duration} мин)
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>{booking.partySize} человек</span>
            </div>
          </div>

          {/* Contact info */}
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>{booking.customerPhone}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              <span className="truncate">{booking.customerEmail}</span>
            </div>
          </div>
        </div>

        {/* Special requests */}
        {booking.specialRequests && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Особые пожелания:
            </h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {booking.specialRequests}
            </p>
          </div>
        )}

        {/* Notes (for restaurant staff) */}
        {booking.notes && variant !== "customer" && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Заметки:</h4>
            <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Cancellation reason */}
        {booking.status === BookingStatus.CANCELLED && booking.cancelReason && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Причина отмены:
            </h4>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {booking.cancelReason}
            </p>
          </div>
        )}
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter>
          <div className="flex flex-wrap gap-2 w-full">
            {/* Customer actions */}
            {variant === "customer" && (
              <>
                {canCancel() && onCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCancel(booking.$id)}
                    icon={XCircle}
                  >
                    Отменить
                  </Button>
                )}

                {booking.status === BookingStatus.CONFIRMED && isUpcoming() && (
                  <Button variant="secondary" size="sm" icon={MapPin}>
                    Как добраться
                  </Button>
                )}
              </>
            )}

            {/* Restaurant actions */}
            {variant === "restaurant" && (
              <>
                {canConfirm() && onStatusChange && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() =>
                      onStatusChange(booking.$id, BookingStatus.CONFIRMED)
                    }
                    icon={CheckCircle}
                  >
                    Подтвердить
                  </Button>
                )}

                {canCancel() && onStatusChange && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onStatusChange(booking.$id, BookingStatus.CANCELLED)
                    }
                    icon={XCircle}
                  >
                    Отклонить
                  </Button>
                )}

                {booking.status === BookingStatus.CONFIRMED &&
                  isUpcoming() &&
                  onStatusChange && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        onStatusChange(booking.$id, BookingStatus.COMPLETED)
                      }
                    >
                      Завершить
                    </Button>
                  )}

                {booking.status === BookingStatus.CONFIRMED &&
                  isUpcoming() &&
                  onStatusChange && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onStatusChange(booking.$id, BookingStatus.NO_SHOW)
                      }
                    >
                      Не явился
                    </Button>
                  )}
              </>
            )}

            {/* Admin actions */}
            {variant === "admin" && onStatusChange && (
              <div className="flex space-x-2">
                <select
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                  value={booking.status}
                  onChange={(e) =>
                    onStatusChange(booking.$id, e.target.value as BookingStatus)
                  }
                >
                  {Object.values(BookingStatus).map((status) => (
                    <option key={status} value={status}>
                      {getBookingStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
