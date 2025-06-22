// hooks/useRestaurants.ts - Хуки для работы с ресторанами

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Restaurant,
  RestaurantFilters,
  CreateRestaurantDto,
  RestaurantStatus,
  RestaurantStats,
} from "@/types";

export function useAllRestaurants() {
  return useQuery<Restaurant[], Error>({
    queryKey: ["restaurants", "all"],
    queryFn: async (): Promise<Restaurant[]> => {
      const response = await fetch("/api/restaurants/all");
      if (!response.ok) {
        throw new Error("Ошибка загрузки всех ресторанов");
      }
      return response.json();
    },
  });
}

// Хук для получения списка ресторанов с фильтрами
export function useRestaurants(filters?: RestaurantFilters) {
  return useQuery<Restaurant[], Error>({
    queryKey: ["restaurants", filters],
    queryFn: async (): Promise<Restaurant[]> => {
      const params = new URLSearchParams();

      if (filters?.city) params.append("city", filters.city);
      if (filters?.cuisineType?.length) {
        filters.cuisineType.forEach((cuisine) =>
          params.append("cuisine", cuisine)
        );
      }
      if (filters?.priceRange?.length) {
        filters.priceRange.forEach((range) =>
          params.append("priceRange", range)
        );
      }
      if (filters?.rating)
        params.append("minRating", filters.rating.toString());
      if (filters?.searchQuery) params.append("search", filters.searchQuery);
      if (filters?.isOpenNow) params.append("isOpenNow", "true");
      if (filters?.hasAvailableTables)
        params.append("hasAvailableTables", "true");
      if (filters?.date) params.append("date", filters.date);
      if (filters?.time) params.append("time", filters.time);
      if (filters?.guestCount)
        params.append("guestCount", filters.guestCount.toString());
      if (filters?.amenities?.length) {
        filters.amenities.forEach((amenity) =>
          params.append("amenities", amenity)
        );
      }

      const response = await fetch(`/api/restaurants?${params}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки списка ресторанов");
      }
      return response.json();
    },
  });
}

// Хук для получения информации о ресторане
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

// Хук для получения ресторанов владельца
export function useOwnerRestaurants(ownerId: string) {
  return useQuery<Restaurant[], Error>({
    queryKey: ["restaurants", "owner", ownerId],
    queryFn: async (): Promise<Restaurant[]> => {
      const response = await fetch(`/api/restaurants/owner/${ownerId}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки ресторанов владельца");
      }
      return response.json();
    },
    enabled: !!ownerId,
  });
}

// Хук для создания ресторана
export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation<Restaurant, Error, CreateRestaurantDto>({
    mutationFn: async (restaurantData): Promise<Restaurant> => {
      const response = await fetch("/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restaurantData),
      });

      if (!response.ok) {
        throw new Error("Ошибка создания ресторана");
      }

      return response.json();
    },
    onSuccess: (newRestaurant) => {
      // Обновляем кэш после создания
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({
        queryKey: ["restaurants", "owner", newRestaurant.ownerId],
      });
    },
  });
}

// Хук для обновления ресторана
interface UpdateRestaurantData {
  restaurantId: string;
  data: Partial<Restaurant>;
}

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation<Restaurant, Error, UpdateRestaurantData>({
    mutationFn: async ({ restaurantId, data }): Promise<Restaurant> => {
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Ошибка обновления ресторана");
      }

      return response.json();
    },
    onSuccess: (updatedRestaurant) => {
      // Обновляем кэш
      queryClient.setQueryData(
        ["restaurant", updatedRestaurant.$id],
        updatedRestaurant
      );
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({
        queryKey: ["restaurants", "owner", updatedRestaurant.ownerId],
      });
    },
  });
}

// Хук для обновления статуса ресторана (для админов)
interface UpdateRestaurantStatusData {
  restaurantId: string;
  status: RestaurantStatus;
  moderationNote?: string;
}

export function useUpdateRestaurantStatus() {
  const queryClient = useQueryClient();

  return useMutation<Restaurant, Error, UpdateRestaurantStatusData>({
    mutationFn: async ({
      restaurantId,
      status,
      moderationNote,
    }): Promise<Restaurant> => {
      const response = await fetch(`/api/restaurants/${restaurantId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, moderationNote }),
      });

      if (!response.ok) {
        throw new Error("Ошибка обновления статуса ресторана");
      }

      return response.json();
    },
    onSuccess: (updatedRestaurant) => {
      queryClient.setQueryData(
        ["restaurant", updatedRestaurant.$id],
        updatedRestaurant
      );
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

// Хук для удаления ресторана
export function useDeleteRestaurant() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (restaurantId: string): Promise<void> => {
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Ошибка удаления ресторана");
      }
    },
    onSuccess: (_, restaurantId) => {
      // Удаляем из кэша
      queryClient.removeQueries({ queryKey: ["restaurant", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
    },
  });
}

// Хук для получения статистики ресторана
export function useRestaurantStats(
  restaurantId: string,
  period: "day" | "week" | "month" | "year" = "month"
) {
  return useQuery<RestaurantStats, Error>({
    queryKey: ["restaurant-stats", restaurantId, period],
    queryFn: async (): Promise<RestaurantStats> => {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/stats?period=${period}`
      );
      if (!response.ok) {
        throw new Error("Ошибка загрузки статистики ресторана");
      }
      return response.json();
    },
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

// Хук для получения популярных ресторанов
export function usePopularRestaurants(limit: number = 10) {
  return useQuery<Restaurant[], Error>({
    queryKey: ["restaurants", "popular", limit],
    queryFn: async (): Promise<Restaurant[]> => {
      const response = await fetch(`/api/restaurants/popular?limit=${limit}`);
      if (!response.ok) {
        throw new Error("Ошибка загрузки популярных ресторанов");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 15, // 15 минут
  });
}

// Хук для поиска ресторанов по местоположению
export function useNearbyRestaurants(
  latitude: number,
  longitude: number,
  radius: number = 5000 // в метрах
) {
  return useQuery<Restaurant[], Error>({
    queryKey: ["restaurants", "nearby", latitude, longitude, radius],
    queryFn: async (): Promise<Restaurant[]> => {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lng: longitude.toString(),
        radius: radius.toString(),
      });

      const response = await fetch(`/api/restaurants/nearby?${params}`);
      if (!response.ok) {
        throw new Error("Ошибка поиска ресторанов поблизости");
      }
      return response.json();
    },
    enabled: !!(latitude && longitude),
    staleTime: 1000 * 60 * 10, // 10 минут
  });
}

// Хук для загрузки изображений ресторана
export function useUploadRestaurantImages() {
  return useMutation<string[], Error, { restaurantId: string; files: File[] }>({
    mutationFn: async ({ restaurantId, files }): Promise<string[]> => {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`image-${index}`, file);
      });

      const response = await fetch(`/api/restaurants/${restaurantId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Ошибка загрузки изображений");
      }

      const result = await response.json();
      return result.urls;
    },
  });
}
