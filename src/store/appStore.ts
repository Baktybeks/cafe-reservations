// src/store/appStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RestaurantFilters, BookingFilters } from "@/types";

// Store для уведомлений
interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Автоудаление через заданное время
    if (notification.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration || 5000);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

// Store для фильтров и поиска
interface FiltersState {
  restaurantFilters: RestaurantFilters;
  bookingFilters: BookingFilters;

  setRestaurantFilters: (filters: Partial<RestaurantFilters>) => void;
  setBookingFilters: (filters: Partial<BookingFilters>) => void;
  clearRestaurantFilters: () => void;
  clearBookingFilters: () => void;
}

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set, get) => ({
      restaurantFilters: {},
      bookingFilters: {},

      setRestaurantFilters: (filters) => {
        set((state) => ({
          restaurantFilters: { ...state.restaurantFilters, ...filters },
        }));
      },

      setBookingFilters: (filters) => {
        set((state) => ({
          bookingFilters: { ...state.bookingFilters, ...filters },
        }));
      },

      clearRestaurantFilters: () => {
        set({ restaurantFilters: {} });
      },

      clearBookingFilters: () => {
        set({ bookingFilters: {} });
      },
    }),
    {
      name: "filters-storage",
    }
  )
);

// Store для UI состояния
interface UIState {
  sidebarOpen: boolean;
  selectedRestaurantId: string | null;
  selectedBookingId: string | null;
  currentPage: string;

  setSidebarOpen: (open: boolean) => void;
  setSelectedRestaurant: (id: string | null) => void;
  setSelectedBooking: (id: string | null) => void;
  setCurrentPage: (page: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  selectedRestaurantId: null,
  selectedBookingId: null,
  currentPage: "/",

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSelectedRestaurant: (selectedRestaurantId) =>
    set({ selectedRestaurantId }),
  setSelectedBooking: (selectedBookingId) => set({ selectedBookingId }),
  setCurrentPage: (currentPage) => set({ currentPage }),
}));

// Store для данных приложения (кеш)
interface AppDataState {
  favoriteRestaurants: string[];
  recentSearches: string[];
  bookingHistory: string[];

  addFavoriteRestaurant: (restaurantId: string) => void;
  removeFavoriteRestaurant: (restaurantId: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  addToBookingHistory: (bookingId: string) => void;
}

export const useAppDataStore = create<AppDataState>()(
  persist(
    (set, get) => ({
      favoriteRestaurants: [],
      recentSearches: [],
      bookingHistory: [],

      addFavoriteRestaurant: (restaurantId) => {
        const favorites = get().favoriteRestaurants;
        if (!favorites.includes(restaurantId)) {
          set({ favoriteRestaurants: [...favorites, restaurantId] });
        }
      },

      removeFavoriteRestaurant: (restaurantId) => {
        set((state) => ({
          favoriteRestaurants: state.favoriteRestaurants.filter(
            (id) => id !== restaurantId
          ),
        }));
      },

      addRecentSearch: (query) => {
        const searches = get().recentSearches;
        const updatedSearches = [
          query,
          ...searches.filter((s) => s !== query),
        ].slice(0, 10); // Храним только последние 10 поисков
        set({ recentSearches: updatedSearches });
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] });
      },

      addToBookingHistory: (bookingId) => {
        const history = get().bookingHistory;
        if (!history.includes(bookingId)) {
          set({ bookingHistory: [...history, bookingId] });
        }
      },
    }),
    {
      name: "app-data-storage",
    }
  )
);
