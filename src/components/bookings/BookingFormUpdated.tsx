// src/components/bookings/BookingFormUpdated.tsx
// Версия с кастомным DatePicker

"use client";

import React, { useState, useEffect } from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { useCreateBooking, useTableAvailability } from "@/hooks/useBookings";
import { useRestaurantTables } from "@/hooks/useRestaurants";
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";
import { Restaurant, CreateBookingDto } from "@/types";

interface BookingFormProps {
  restaurant: Restaurant;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BookingForm({
  restaurant,
  onSuccess,
  onCancel,
}: BookingFormProps) {
  const { user } = useAuth();
  const createBooking = useCreateBooking();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [partySize, setPartySize] = useState(2);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [specialRequests, setSpecialRequests] = useState("");
  const [selectedTableId, setSelectedTableId] = useState("");

  const dateString = selectedDate?.toISOString().split("T")[0] || "";

  // Получаем столики ресторана
  const { data: tables = [] } = useRestaurantTables(restaurant.$id);

  // Получаем доступность на выбранную дату
  const { data: availability, isLoading: availabilityLoading } =
    useTableAvailability(restaurant.$id, dateString);

  // Заполняем данные пользователя при изменении
  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
      setCustomerPhone(user.phone || "");
    }
  }, [user]);

  // Сброс времени и столика при изменении даты
  useEffect(() => {
    setSelectedTime("");
    setSelectedTableId("");
  }, [selectedDate]);

  // Сброс столика при изменении времени или количества человек
  useEffect(() => {
    setSelectedTableId("");
  }, [selectedTime, partySize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime || !selectedTableId) {
      return;
    }

    const bookingData: CreateBookingDto = {
      restaurantId: restaurant.$id,
      tableId: selectedTableId,
      date: dateString,
      timeSlot: selectedTime,
      partySize,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests: specialRequests || undefined,
    };

    try {
      await createBooking.mutateAsync({
        data: bookingData,
        customerId: user!.$id,
      });

      onSuccess?.();
    } catch (error) {
      console.error("Ошибка при создании бронирования:", error);
    }
  };

  const isFormValid = () => {
    return (
      selectedDate &&
      selectedTime &&
      selectedTableId &&
      customerName.trim() &&
      customerEmail.trim() &&
      customerPhone.trim() &&
      partySize > 0
    );
  };

  // Фильтруем доступные временные слоты
  const availableTimeSlots =
    availability?.timeSlots.filter((slot) => slot.isAvailable) || [];

  // Фильтруем столики по вместимости
  const suitableTables = tables.filter(
    (table) => table.capacity >= partySize && table.isActive
  );

  // Получаем минимальную и максимальную дату для бронирования
  const getMinDate = () => {
    const minHours = restaurant.bookingSettings.minAdvanceBookingHours;
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + minHours);

    // Если минимальное время уже на завтра, возвращаем завтра
    if (minDate.getDate() !== new Date().getDate()) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    }

    // Иначе возвращаем текущий день
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(
      maxDate.getDate() + restaurant.bookingSettings.maxAdvanceBookingDays
    );
    return maxDate;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Дата и время */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Выбор даты */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Дата бронирования
            <span className="text-red-500 ml-1">*</span>
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            minDate={getMinDate()}
            maxDate={getMaxDate()}
            placeholder="Выберите дату"
            className="w-full"
          />
          <p className="mt-1 text-sm text-gray-500">
            Бронирование доступно на{" "}
            {restaurant.bookingSettings.maxAdvanceBookingDays} дней вперед
          </p>
        </div>

        {/* Количество человек */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Количество человек
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <select
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              {[...Array(restaurant.bookingSettings.maxPartySize)].map(
                (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? "человек" : "человека"}
                  </option>
                )
              )}
            </select>
            <Users className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Выбор времени */}
      {selectedDate && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Время
            <span className="text-red-500 ml-1">*</span>
          </label>

          {availabilityLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">
                Проверяем доступность...
              </span>
            </div>
          ) : availableTimeSlots.length > 0 ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => setSelectedTime(slot.time)}
                  className={`p-3 text-sm rounded-lg border transition-colors ${
                    selectedTime === slot.time
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 hover:border-gray-400 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {slot.time}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {slot.availableTables} столиков
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent padding="sm">
                <div className="flex items-center text-amber-600">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>На выбранную дату нет свободных столиков</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Попробуйте выбрать другую дату или обратитесь к администратору
                  ресторана
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Выбор столика */}
      {selectedTime && suitableTables.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Столик
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {suitableTables.map((table) => (
              <button
                key={table.$id}
                type="button"
                onClick={() => setSelectedTableId(table.$id)}
                className={`p-4 text-left rounded-lg border transition-colors ${
                  selectedTableId === table.$id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      Столик {table.tableNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      До {table.capacity} человек • {table.type}
                    </div>
                    {table.location && (
                      <div className="text-xs text-gray-500 mt-1">
                        {table.location}
                      </div>
                    )}
                  </div>
                  {selectedTableId === table.$id && (
                    <CheckCircle className="h-5 w-5 text-indigo-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Контактная информация */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Контактная информация
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Имя"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Ваше имя"
            icon={Users}
            required
          />

          <Input
            label="Телефон"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+996 (999) 123-45-67"
            icon={Phone}
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="your@email.com"
          icon={Mail}
          required
        />
      </div>

      {/* Особые пожелания */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Особые пожелания
        </label>
        <div className="relative">
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none"
            placeholder="Укажите особые пожелания: детский стульчик, праздничный стол, аллергии и т.д."
          />
          <MessageSquare className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Информация о политике отмены */}
      {restaurant.bookingSettings.cancellationPolicy && (
        <Card>
          <CardContent padding="sm">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Политика отмены бронирования
                </h4>
                <p className="text-sm text-gray-600">
                  {restaurant.bookingSettings.cancellationPolicy}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кнопки действий */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={createBooking.isPending}
          disabled={!isFormValid()}
          icon={Calendar}
        >
          {createBooking.isPending
            ? "Создаем бронирование..."
            : "Забронировать"}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            fullWidth
            size="lg"
            onClick={onCancel}
            disabled={createBooking.isPending}
          >
            Отмена
          </Button>
        )}
      </div>
    </form>
  );
}
