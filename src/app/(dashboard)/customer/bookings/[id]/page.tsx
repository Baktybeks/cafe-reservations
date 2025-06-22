// src/app/(dashboard)/customer/bookings/[id]/page.tsx

"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useBooking, useCancelBooking } from "@/hooks/useBookings";
import { useRestaurant } from "@/hooks/useRestaurants";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  XCircle,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  Star,
  ExternalLink,
  Edit,
} from "lucide-react";
import { BookingStatus, getBookingStatusLabel } from "@/types";
import { formatDate, formatTime, copyToClipboard } from "@/utils";

export default function CustomerBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const bookingId = params.id as string;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const cancelBooking = useCancelBooking();

  // Получаем данные
  const {
    data: booking,
    isLoading: bookingLoading,
    refetch,
  } = useBooking(bookingId);
  const { data: restaurant, isLoading: restaurantLoading } = useRestaurant(
    booking?.restaurantId || ""
  );

  const isLoading = bookingLoading || restaurantLoading;

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Бронирование не найдено
                </h3>
                <p className="text-gray-500 mb-6">
                  Запрашиваемое бронирование не существует или было удалено
                </p>
                <Button onClick={() => router.push("/customer/bookings")}>
                  К списку бронирований
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Проверяем, принадлежит ли бронирование пользователю
  if (booking.customerId !== user?.$id) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent>
              <div className="text-center py-8">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Доступ запрещен
                </h3>
                <p className="text-gray-500 mb-6">
                  У вас нет прав для просмотра этого бронирования
                </p>
                <Button onClick={() => router.push("/customer/bookings")}>
                  К списку бронирований
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case BookingStatus.CONFIRMED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case BookingStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case BookingStatus.CANCELLED:
      case BookingStatus.NO_SHOW:
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

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

  const canCancel = () => {
    return (
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.CONFIRMED
    );
  };

  const isUpcoming = () => {
    const bookingDateTime = new Date(`${booking.date}T${booking.timeSlot}`);
    return bookingDateTime > new Date();
  };

  const handleCancelBooking = async () => {
    try {
      await cancelBooking.mutateAsync({
        bookingId: booking.$id,
        reason: cancelReason || "Отменено клиентом",
      });

      setShowCancelModal(false);
      setCancelReason("");
      refetch();
    } catch (error) {
      console.error("Ошибка отмены бронирования:", error);
    }
  };

  const handleCopyConfirmationCode = () => {
    copyToClipboard(booking.confirmationCode);
  };

  const handleViewRestaurant = () => {
    if (restaurant) {
      router.push(`/restaurants/${restaurant.$id}`);
    }
  };

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
                  onClick={() => router.push("/customer/bookings")}
                  icon={ArrowLeft}
                >
                  К бронированиям
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Calendar className="h-6 w-6 mr-3 text-indigo-600" />
                    Детали бронирования
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Код: {booking.confirmationCode}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {getStatusIcon(booking.status)}
                <Badge variant={getStatusVariant(booking.status)}>
                  {getBookingStatusLabel(booking.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Информация о бронировании</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDate(booking.date)}
                          </div>
                          <div className="text-sm text-gray-500">Дата</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.timeSlot}
                          </div>
                          <div className="text-sm text-gray-500">
                            Продолжительность: {booking.duration} мин
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.partySize} человек
                          </div>
                          <div className="text-sm text-gray-500">
                            Количество гостей
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Copy className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {booking.confirmationCode}
                          </div>
                          <div className="text-sm text-gray-500">
                            Код подтверждения
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyConfirmationCode}
                          icon={Copy}
                        >
                          Копировать
                        </Button>
                      </div>

                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.customerEmail}
                          </div>
                          <div className="text-sm text-gray-500">Email</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {booking.customerPhone}
                          </div>
                          <div className="text-sm text-gray-500">Телефон</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-start">
                        <MessageSquare className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            Особые пожелания
                          </div>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {booking.specialRequests}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-start">
                        <MessageSquare className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            Заметки ресторана
                          </div>
                          <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                            {booking.notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Restaurant Info */}
              {restaurant && (
                <Card>
                  <CardHeader>
                    <CardTitle>Информация о ресторане</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      {restaurant.images?.[0] && (
                        <img
                          src={restaurant.images[0]}
                          alt={restaurant.name}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {restaurant.name}
                        </h3>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>
                              {restaurant.address.street},{" "}
                              {restaurant.address.city}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{restaurant.phone}</span>
                          </div>

                          <div className="flex items-center text-gray-600">
                            <Star className="h-4 w-4 mr-2 text-yellow-400 fill-current" />
                            <span>
                              {restaurant.averageRating.toFixed(1)} (
                              {restaurant.totalReviews} отзывов)
                            </span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleViewRestaurant}
                            icon={ExternalLink}
                          >
                            Подробнее о ресторане
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cancellation Info */}
              {booking.status === BookingStatus.CANCELLED &&
                booking.cancelReason && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-red-600">
                        Информация об отмене
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-red-800">{booking.cancelReason}</p>
                        {booking.cancelledAt && (
                          <p className="text-sm text-red-600 mt-2">
                            Отменено: {formatDate(booking.cancelledAt)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canCancel() && isUpcoming() && (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => setShowCancelModal(true)}
                      icon={XCircle}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Отменить бронирование
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      // Экспорт деталей бронирования
                      console.log("Экспорт бронирования");
                    }}
                    icon={Download}
                  >
                    Скачать детали
                  </Button>

                  {restaurant && (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={handleViewRestaurant}
                      icon={ExternalLink}
                    >
                      Перейти к ресторану
                    </Button>
                  )}

                  {booking.status === BookingStatus.COMPLETED && (
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        // Оставить отзыв
                        router.push(
                          `/restaurants/${restaurant?.$id}/review?booking=${booking.$id}`
                        );
                      }}
                      icon={Star}
                    >
                      Оставить отзыв
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>История изменений</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Бронирование создано
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(booking.$createdAt)}
                        </p>
                      </div>
                    </div>

                    {booking.confirmedAt && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Бронирование подтверждено
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(booking.confirmedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {booking.cancelledAt && (
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Бронирование отменено
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(booking.cancelledAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Help */}
              <Card>
                <CardHeader>
                  <CardTitle>Нужна помощь?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-gray-600 mb-4">
                    Если у вас есть вопросы по этому бронированию, свяжитесь с
                    рестораном:
                  </p>

                  {restaurant && (
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
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <a
                          href={`mailto:${restaurant.email}`}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          {restaurant.email}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Cancel Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Отмена бронирования"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">
                    Внимание!
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Вы действительно хотите отменить это бронирование? Это
                    действие нельзя отменить.
                  </p>
                </div>
              </div>
            </div>

            <Input
              label="Причина отмены (необязательно)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Укажите причину отмены..."
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowCancelModal(false)}
              >
                Не отменять
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={handleCancelBooking}
                loading={cancelBooking.isPending}
                icon={XCircle}
              >
                Подтвердить отмену
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
