// src/hooks/useBookings.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Query } from "appwrite";
import { appwriteService } from "@/services/appwriteService";
import { useNotificationStore } from "@/store/appStore";
import {
  Booking,
  BookingFilters,
  CreateBookingDto,
  BookingStatus,
  TableAvailability,
  TimeSlot,
} from "@/types";

// Query keys
export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (filters?: BookingFilters) =>
    [...bookingKeys.lists(), filters] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  user: (userId: string) => [...bookingKeys.all, "user", userId] as const,
  restaurant: (restaurantId: string) =>
    [...bookingKeys.all, "restaurant", restaurantId] as const,
  availability: (restaurantId: string, date: string) =>
    [...bookingKeys.all, "availability", restaurantId, date] as const,
};

// Хук для получения бронирований с фильтрацией
export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: async () => {
      const queries: string[] = [Query.orderDesc("$createdAt")];

      // Применяем фильтры
      if (filters?.restaurantId) {
        queries.push(Query.equal("restaurantId", filters.restaurantId));
      }

      if (filters?.customerId) {
        queries.push(Query.equal("customerId", filters.customerId));
      }

      if (filters?.status?.length) {
        queries.push(Query.equal("status", filters.status));
      }

      if (filters?.dateFrom) {
        queries.push(Query.greaterThanEqual("date", filters.dateFrom));
      }

      if (filters?.dateTo) {
        queries.push(Query.lessThanEqual("date", filters.dateTo));
      }

      const bookings = await appwriteService.getBookings(queries);

      // Дополнительная фильтрация на клиенте
      if (filters?.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        return bookings.filter(
          (booking) =>
            booking.customerName.toLowerCase().includes(searchLower) ||
            booking.customerEmail.toLowerCase().includes(searchLower) ||
            booking.confirmationCode.toLowerCase().includes(searchLower)
        );
      }

      return bookings;
    },
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
}

// Хук для получения бронирований пользователя
export function useUserBookings(userId: string) {
  return useQuery({
    queryKey: bookingKeys.user(userId),
    queryFn: () => appwriteService.getUserBookings(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 минута
  });
}

// Хук для получения бронирований ресторана
export function useRestaurantBookings(restaurantId: string) {
  return useQuery({
    queryKey: bookingKeys.restaurant(restaurantId),
    queryFn: () => appwriteService.getRestaurantBookings(restaurantId),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 1, // 1 минута
  });
}

// Хук для получения конкретного бронирования
export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: async () => {
      const bookings = await appwriteService.getBookings([
        Query.equal("$id", id),
      ]);
      return bookings[0] || null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

// Хук для создания бронирования
export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({
      data,
      customerId,
    }: {
      data: CreateBookingDto;
      customerId: string;
    }) => appwriteService.createBooking(data, customerId),
    onSuccess: (booking) => {
      // Инвалидируем связанные запросы
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.user(booking.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: bookingKeys.restaurant(booking.restaurantId),
      });

      // Инвалидируем доступность для этого ресторана и даты
      queryClient.invalidateQueries({
        queryKey: bookingKeys.availability(booking.restaurantId, booking.date),
      });

      addNotification({
        type: "success",
        title: "Бронирование создано",
        message: `Ваше бронирование подтверждено. Код: ${booking.confirmationCode}`,
        duration: 8000,
      });
    },
    onError: (error: any) => {
      addNotification({
        type: "error",
        title: "Ошибка бронирования",
        message: error.message || "Не удалось создать бронирование",
      });
    },
  });
}

// Хук для обновления статуса бронирования
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({
      bookingId,
      status,
      notes,
    }: {
      bookingId: string;
      status: BookingStatus;
      notes?: string;
    }) => appwriteService.updateBookingStatus(bookingId, status, notes),
    onSuccess: (booking, variables) => {
      if (booking) {
        // Обновляем кеш конкретного бронирования
        queryClient.setQueryData(bookingKeys.detail(booking.$id), booking);

        // Инвалидируем списки
        queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: bookingKeys.user(booking.customerId),
        });
        queryClient.invalidateQueries({
          queryKey: bookingKeys.restaurant(booking.restaurantId),
        });

        // Инвалидируем доступность
        queryClient.invalidateQueries({
          queryKey: bookingKeys.availability(
            booking.restaurantId,
            booking.date
          ),
        });

        const statusText =
          {
            [BookingStatus.PENDING]: "ожидает подтверждения",
            [BookingStatus.CONFIRMED]: "подтверждено",
            [BookingStatus.CANCELLED]: "отменено",
            [BookingStatus.COMPLETED]: "завершено",
            [BookingStatus.NO_SHOW]: "отмечено как неявка",
          }[variables.status] || "обновлено";

        addNotification({
          type:
            variables.status === BookingStatus.CONFIRMED
              ? "success"
              : "warning",
          title: "Статус изменен",
          message: `Бронирование ${statusText}`,
        });
      }
    },
    onError: (error: any) => {
      addNotification({
        type: "error",
        title: "Ошибка обновления",
        message: error.message || "Не удалось обновить статус бронирования",
      });
    },
  });
}

// Хук для отмены бронирования
export function useCancelBooking() {
  const updateBookingStatus = useUpdateBookingStatus();

  return useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: string;
      reason?: string;
    }) =>
      updateBookingStatus.mutateAsync({
        bookingId,
        status: BookingStatus.CANCELLED,
        notes: reason,
      }),
  });
}

// Хук для подтверждения бронирования
export function useConfirmBooking() {
  const updateBookingStatus = useUpdateBookingStatus();

  return useMutation({
    mutationFn: ({ bookingId, notes }: { bookingId: string; notes?: string }) =>
      updateBookingStatus.mutateAsync({
        bookingId,
        status: BookingStatus.CONFIRMED,
        notes,
      }),
  });
}

// Хук для получения доступности столиков
export function useTableAvailability(restaurantId: string, date: string) {
  return useQuery({
    queryKey: bookingKeys.availability(restaurantId, date),
    queryFn: async (): Promise<TableAvailability> => {
      if (!restaurantId || !date) {
        return { date, timeSlots: [] };
      }

      // Получаем столики ресторана
      const tables = await appwriteService.getRestaurantTables(restaurantId);

      // Получаем существующие бронирования на эту дату
      const bookings = await appwriteService.getBookings([
        Query.equal("restaurantId", restaurantId),
        Query.equal("date", date),
        Query.notEqual("status", BookingStatus.CANCELLED),
      ]);

      // Генерируем временные слоты (например, каждые 30 минут с 12:00 до 23:00)
      const timeSlots: TimeSlot[] = [];
      const startHour = 12;
      const endHour = 23;
      const slotInterval = 30; // минут

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotInterval) {
          const time = `${hour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")}`;

          // Подсчитываем занятые столики на это время
          const bookedTables = bookings.filter((booking) => {
            const bookingTime = booking.timeSlot;
            const bookingEndTime = addMinutes(bookingTime, booking.duration);
            return timeInRange(time, bookingTime, bookingEndTime);
          }).length;

          const availableTables = tables.length - bookedTables;

          timeSlots.push({
            time,
            availableTables: Math.max(0, availableTables),
            totalTables: tables.length,
            isAvailable: availableTables > 0,
          });
        }
      }

      return { date, timeSlots };
    },
    enabled: !!restaurantId && !!date,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

// Вспомогательные функции
function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, "0")}:${newMins
    .toString()
    .padStart(2, "0")}`;
}

function timeInRange(
  checkTime: string,
  startTime: string,
  endTime: string
): boolean {
  const check = timeToMinutes(checkTime);
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  return check >= start && check < end;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Хук для получения предстоящих бронирований
export function useUpcomingBookings(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: [...bookingKeys.user(userId), { upcoming: true }],
    queryFn: async () => {
      const bookings = await appwriteService.getUserBookings(userId);
      return bookings.filter(
        (booking) =>
          booking.date >= today &&
          [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(
            booking.status
          )
      );
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}
