// src/hooks/useRestaurants.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Query } from "appwrite";
import { appwriteService } from "@/services/appwriteService";
import { useNotificationStore } from "@/store/appStore";
import {
  Restaurant,
  RestaurantFilters,
  CreateRestaurantDto,
  RestaurantStatus,
  CuisineType,
  PriceRange,
} from "@/types";

// Query keys
export const restaurantKeys = {
  all: ["restaurants"] as const,
  lists: () => [...restaurantKeys.all, "list"] as const,
  list: (filters?: RestaurantFilters) =>
    [...restaurantKeys.lists(), filters] as const,
  details: () => [...restaurantKeys.all, "detail"] as const,
  detail: (id: string) => [...restaurantKeys.details(), id] as const,
  stats: (id: string) => [...restaurantKeys.all, "stats", id] as const,
  tables: (id: string) => [...restaurantKeys.all, "tables", id] as const,
  reviews: (id: string) => [...restaurantKeys.all, "reviews", id] as const,
};

// Хук для получения списка ресторанов с фильтрацией
export function useRestaurants(filters?: RestaurantFilters) {
  return useQuery({
    queryKey: restaurantKeys.list(filters),
    queryFn: async () => {
      const queries: string[] = [Query.orderDesc("$createdAt")];

      // Применяем фильтры
      if (filters?.cuisineType?.length) {
        queries.push(Query.equal("cuisineType", filters.cuisineType));
      }

      if (filters?.priceRange?.length) {
        queries.push(Query.equal("priceRange", filters.priceRange));
      }

      if (filters?.city) {
        queries.push(Query.equal("address.city", filters.city));
      }

      if (filters?.rating) {
        queries.push(Query.greaterThanEqual("averageRating", filters.rating));
      }

      // ИСПРАВЛЕНО: Показываем только одобренные рестораны, если не указано showAll
      // Это позволит админам видеть все рестораны, включая на модерации
      if (!filters?.showAll) {
        queries.push(Query.equal("status", RestaurantStatus.APPROVED));
      }

      const restaurants = await appwriteService.getRestaurants(queries);

      // Дополнительная фильтрация на клиенте
      let filteredRestaurants = restaurants;

      if (filters?.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        filteredRestaurants = restaurants.filter(
          (restaurant) =>
            restaurant.name.toLowerCase().includes(searchLower) ||
            restaurant.description.toLowerCase().includes(searchLower) ||
            restaurant.address.city.toLowerCase().includes(searchLower) ||
            restaurant.cuisineType.some((cuisine) =>
              cuisine.toLowerCase().includes(searchLower)
            )
        );
      }

      if (filters?.amenities?.length) {
        filteredRestaurants = filteredRestaurants.filter((restaurant) =>
          filters.amenities!.every((amenity) =>
            restaurant.amenities.includes(amenity)
          )
        );
      }

      return filteredRestaurants;
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}

// Хук для получения конкретного ресторана
export function useRestaurant(id: string) {
  return useQuery({
    queryKey: restaurantKeys.detail(id),
    queryFn: () => appwriteService.getRestaurantById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 минуты
  });
}

// Хук для получения ресторанов владельца
export function useOwnerRestaurants(ownerId: string) {
  return useQuery({
    queryKey: [...restaurantKeys.lists(), { ownerId }],
    queryFn: () =>
      appwriteService.getRestaurants([
        Query.equal("ownerId", ownerId),
        Query.orderDesc("$createdAt"),
      ]),
    enabled: !!ownerId,
    staleTime: 1000 * 60 * 2,
  });
}

// ДОБАВЛЕН: Хук специально для админов - показывает все рестораны
export function useAllRestaurants(
  filters?: Omit<RestaurantFilters, "showAll">
) {
  return useRestaurants({ ...filters, showAll: true });
}

// Хук для получения статистики ресторана
export function useRestaurantStats(restaurantId: string) {
  return useQuery({
    queryKey: restaurantKeys.stats(restaurantId),
    queryFn: () => appwriteService.getRestaurantStats(restaurantId),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 10, // 10 минут
  });
}

// Хук для получения столиков ресторана
export function useRestaurantTables(restaurantId: string) {
  return useQuery({
    queryKey: restaurantKeys.tables(restaurantId),
    queryFn: () => appwriteService.getRestaurantTables(restaurantId),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5,
  });
}

// Хук для получения отзывов ресторана
export function useRestaurantReviews(restaurantId: string) {
  return useQuery({
    queryKey: restaurantKeys.reviews(restaurantId),
    queryFn: () => appwriteService.getRestaurantReviews(restaurantId),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5,
  });
}

// Хук для создания ресторана
export function useCreateRestaurant() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({
      data,
      ownerId,
    }: {
      data: CreateRestaurantDto;
      ownerId: string;
    }) => appwriteService.createRestaurant(data, ownerId),
    onSuccess: (restaurant) => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() });

      addNotification({
        type: "success",
        title: "Ресторан создан",
        message: `Ресторан "${restaurant.name}" отправлен на модерацию`,
      });
    },
    onError: (error: any) => {
      addNotification({
        type: "error",
        title: "Ошибка создания",
        message: error.message || "Не удалось создать ресторан",
      });
    },
  });
}

// Хук для обновления ресторана
export function useUpdateRestaurant() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Restaurant> }) =>
      appwriteService.updateRestaurant(id, data),
    onSuccess: (restaurant) => {
      if (restaurant) {
        queryClient.setQueryData(
          restaurantKeys.detail(restaurant.$id),
          restaurant
        );
        queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() });

        addNotification({
          type: "success",
          title: "Ресторан обновлен",
          message: "Информация о ресторане успешно обновлена",
        });
      }
    },
    onError: (error: any) => {
      addNotification({
        type: "error",
        title: "Ошибка обновления",
        message: error.message || "Не удалось обновить ресторан",
      });
    },
  });
}

// Хук для модерации ресторана (для админов)
export function useModerateRestaurant() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: RestaurantStatus;
      note?: string;
    }) =>
      appwriteService.updateRestaurant(id, {
        status,
        ...(note && { moderationNote: note }),
      }),
    onSuccess: (restaurant, variables) => {
      if (restaurant) {
        queryClient.setQueryData(
          restaurantKeys.detail(restaurant.$id),
          restaurant
        );
        queryClient.invalidateQueries({ queryKey: restaurantKeys.lists() });

        const statusText =
          variables.status === RestaurantStatus.APPROVED
            ? "одобрен"
            : "отклонен";

        addNotification({
          type:
            variables.status === RestaurantStatus.APPROVED
              ? "success"
              : "warning",
          title: "Статус изменен",
          message: `Ресторан "${restaurant.name}" ${statusText}`,
        });
      }
    },
    onError: (error: any) => {
      addNotification({
        type: "error",
        title: "Ошибка модерации",
        message: error.message || "Не удалось изменить статус ресторана",
      });
    },
  });
}

// Хук для поиска ресторанов
export function useSearchRestaurants(searchQuery: string) {
  return useQuery({
    queryKey: [...restaurantKeys.lists(), { search: searchQuery }],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return [];
      }

      // Получаем все одобренные рестораны и фильтруем на клиенте
      const restaurants = await appwriteService.getRestaurants([
        Query.equal("status", RestaurantStatus.APPROVED),
        Query.orderDesc("averageRating"),
      ]);

      const searchLower = searchQuery.toLowerCase();
      return restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(searchLower) ||
          restaurant.description.toLowerCase().includes(searchLower) ||
          restaurant.address.city.toLowerCase().includes(searchLower) ||
          restaurant.cuisineType.some((cuisine) =>
            cuisine.toLowerCase().includes(searchLower)
          ) ||
          restaurant.amenities.some((amenity) =>
            amenity.toLowerCase().includes(searchLower)
          )
      );
    },
    enabled: !!searchQuery.trim(),
    staleTime: 1000 * 60 * 5,
  });
}

// Хук для получения популярных ресторанов
export function usePopularRestaurants(limit = 10) {
  return useQuery({
    queryKey: [...restaurantKeys.lists(), { popular: true, limit }],
    queryFn: async () => {
      const restaurants = await appwriteService.getRestaurants([
        Query.equal("status", RestaurantStatus.APPROVED),
        Query.greaterThan("averageRating", 4.0),
        Query.orderDesc("averageRating"),
        Query.limit(limit),
      ]);
      return restaurants;
    },
    staleTime: 1000 * 60 * 30, // 30 минут
  });
}

// Хук для получения ресторанов по кухне
export function useRestaurantsByCuisine(cuisineType: CuisineType) {
  return useQuery({
    queryKey: [...restaurantKeys.lists(), { cuisine: cuisineType }],
    queryFn: () =>
      appwriteService.getRestaurants([
        Query.equal("status", RestaurantStatus.APPROVED),
        Query.equal("cuisineType", cuisineType),
        Query.orderDesc("averageRating"),
      ]),
    enabled: !!cuisineType,
    staleTime: 1000 * 60 * 15,
  });
}
