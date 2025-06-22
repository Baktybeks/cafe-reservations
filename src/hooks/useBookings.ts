// hooks/useBookings.ts - пример типизированных хуков

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Booking, BookingFilters, BookingStatus } from "@/types";

// Типизированный хук для получения бронирований пользователя
export function useUserBookings(userId: string) {
  return useQuery<Booking[], Error>({
    queryKey: ["bookings", "user", userId],
    queryFn: async (): Promise<Booking[]> => {
      const response = await fetch(`/api/bookings/user/${userId}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки бронирований");
      }
      return response.json();
    },
    enabled: !!userId,
  });
}

// Типизированный хук для отмены бронирования
interface CancelBookingParams {
  bookingId: string;
  reason: string;
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, CancelBookingParams>({
    mutationFn: async ({ bookingId, reason }): Promise<Booking> => {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error("Ошибка отмены бронирования");
      }

      return response.json();
    },
    onSuccess: () => {
      // Обновляем кэш после успешной отмены
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// Хук для создания нового бронирования
interface CreateBookingParams {
  restaurantId: string;
  date: string;
  time: string;
  guestCount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, CreateBookingParams>({
    mutationFn: async (bookingData): Promise<Booking> => {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        throw new Error("Ошибка создания бронирования");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// Хук для обновления статуса бронирования (для ресторанов)
interface UpdateBookingStatusParams {
  bookingId: string;
  status: BookingStatus;
  notes?: string;
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, UpdateBookingStatusParams>({
    mutationFn: async ({ bookingId, status, notes }): Promise<Booking> => {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        throw new Error("Ошибка обновления статуса бронирования");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// Типы для доступности столиков
interface TimeSlot {
  time: string;
  available: boolean;
  capacity: number;
  bookedCount: number;
}

interface TableAvailability {
  date: string;
  timeSlots: TimeSlot[];
  totalTables: number;
  availableTables: number;
}

interface AvailabilityParams {
  restaurantId: string;
  date: string;
  guestCount?: number;
}

// Хук для проверки доступности столиков
export function useTableAvailability(params: AvailabilityParams) {
  return useQuery<TableAvailability, Error>({
    queryKey: [
      "availability",
      params.restaurantId,
      params.date,
      params.guestCount,
    ],
    queryFn: async (): Promise<TableAvailability> => {
      const searchParams = new URLSearchParams({
        restaurantId: params.restaurantId,
        date: params.date,
        ...(params.guestCount && { guestCount: params.guestCount.toString() }),
      });

      const response = await fetch(`/api/availability?${searchParams}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки доступности столиков");
      }

      return response.json();
    },
    enabled: !!(params.restaurantId && params.date),
    staleTime: 1000 * 60 * 2, // 2 минуты
    refetchInterval: 1000 * 60 * 5, // Обновляем каждые 5 минут
  });
}

// Хук для получения доступных временных слотов
export function useAvailableTimeSlots(
  restaurantId: string,
  date: string,
  guestCount: number
) {
  return useQuery<string[], Error>({
    queryKey: ["timeSlots", restaurantId, date, guestCount],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch(
        `/api/availability/time-slots?restaurantId=${restaurantId}&date=${date}&guestCount=${guestCount}`
      );

      if (!response.ok) {
        throw new Error("Ошибка загрузки временных слотов");
      }

      const data = await response.json();
      return data.availableSlots || [];
    },
    enabled: !!(restaurantId && date && guestCount > 0),
    staleTime: 1000 * 60 * 2,
  });
}

// Хук для резервирования временного слота (опциональная предварительная резервация)
interface ReserveSlotParams {
  restaurantId: string;
  date: string;
  time: string;
  guestCount: number;
}

export function useReserveTimeSlot() {
  const queryClient = useQueryClient();

  return useMutation<
    { reservationToken: string; expiresIn: number },
    Error,
    ReserveSlotParams
  >({
    mutationFn: async (
      params
    ): Promise<{ reservationToken: string; expiresIn: number }> => {
      const response = await fetch("/api/availability/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Ошибка резервирования временного слота");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Обновляем данные о доступности после резервирования
      queryClient.invalidateQueries({
        queryKey: ["availability", variables.restaurantId, variables.date],
      });
      queryClient.invalidateQueries({
        queryKey: ["timeSlots", variables.restaurantId, variables.date],
      });
    },
  });
}

// Хук для получения информации о ресторане
interface Restaurant {
  $id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
  cuisine: string[];
  priceRange: string;
  rating: number;
  images: string[];
  workingHours: {
    [key: string]: { open: string; close: string; closed?: boolean };
  };
  capacity: number;
  features: string[];
}

export function useRestaurant(restaurantId: string) {
  return useQuery<Restaurant, Error>({
    queryKey: ["restaurant", restaurantId],
    queryFn: async (): Promise<Restaurant> => {
      const response = await fetch(`/api/restaurants/${restaurantId}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки информации о ресторане");
      }
      return response.json();
    },
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 10, // 10 минут
  });
}

// Хук для получения бронирований ресторана (для владельцев)
export function useRestaurantBookings(restaurantId: string, date?: string) {
  return useQuery<Booking[], Error>({
    queryKey: ["bookings", "restaurant", restaurantId, date],
    queryFn: async (): Promise<Booking[]> => {
      const params = new URLSearchParams({ restaurantId });
      if (date) params.append("date", date);

      const response = await fetch(`/api/bookings/restaurant?${params}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки бронирований ресторана");
      }
      return response.json();
    },
    enabled: !!restaurantId,
  });
}

// Универсальный хук для получения бронирований с фильтрами
export function useBookings(filters?: BookingFilters) {
  return useQuery<Booking[], Error>({
    queryKey: ["bookings", filters],
    queryFn: async (): Promise<Booking[]> => {
      const params = new URLSearchParams();

      if (filters?.restaurantId) {
        params.append("restaurantId", filters.restaurantId);
      }
      if (filters?.customerId) {
        params.append("customerId", filters.customerId);
      }
      if (filters?.status && filters.status !== "all") {
        if (Array.isArray(filters.status)) {
          filters.status.forEach((status) => params.append("status", status));
        } else {
          params.append("status", filters.status);
        }
      }
      if (filters?.dateFrom) {
        params.append("dateFrom", filters.dateFrom);
      }
      if (filters?.dateTo) {
        params.append("dateTo", filters.dateTo);
      }
      if (filters?.searchQuery) {
        params.append("search", filters.searchQuery);
      }

      const response = await fetch(`/api/bookings?${params}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки бронирований");
      }
      return response.json();
    },
    enabled: true,
  });
}

// Хук для получения бронирований нескольких ресторанов
export function useMultipleRestaurantBookings(restaurantIds: string[]) {
  return useQuery<Booking[], Error>({
    queryKey: ["bookings", "multiple-restaurants", restaurantIds],
    queryFn: async (): Promise<Booking[]> => {
      if (restaurantIds.length === 0) {
        return [];
      }

      const params = new URLSearchParams();
      restaurantIds.forEach((id) => params.append("restaurantIds", id));

      const response = await fetch(`/api/bookings/multiple?${params}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки бронирований");
      }
      return response.json();
    },
    enabled: restaurantIds.length > 0,
  });
}
