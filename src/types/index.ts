// src/types/index.ts - Типы для приложения бронирования ресторанов

// Роли пользователей
export enum UserRole {
  ADMIN = "ADMIN",
  RESTAURANT_OWNER = "RESTAURANT_OWNER",
  CUSTOMER = "CUSTOMER",
}

// Типы кухни
export enum CuisineType {
  ITALIAN = "ITALIAN",
  JAPANESE = "JAPANESE",
  CHINESE = "CHINESE",
  FRENCH = "FRENCH",
  INDIAN = "INDIAN",
  MEXICAN = "MEXICAN",
  THAI = "THAI",
  AMERICAN = "AMERICAN",
  MEDITERRANEAN = "MEDITERRANEAN",
  FUSION = "FUSION",
  OTHER = "OTHER",
}

// Ценовые категории
export enum PriceRange {
  BUDGET = "BUDGET", // $
  MODERATE = "MODERATE", // $$
  EXPENSIVE = "EXPENSIVE", // $$$
  LUXURY = "LUXURY", // $$$$
}

// Статусы бронирования
export enum BookingStatus {
  PENDING = "PENDING", // Ожидает подтверждения
  CONFIRMED = "CONFIRMED", // Подтверждено
  CANCELLED = "CANCELLED", // Отменено
  COMPLETED = "COMPLETED", // Завершено
  NO_SHOW = "NO_SHOW", // Не явился
}

// Статусы ресторана
export enum RestaurantStatus {
  PENDING = "PENDING", // Ожидает модерации
  APPROVED = "APPROVED", // Одобрен
  REJECTED = "REJECTED", // Отклонен
  SUSPENDED = "SUSPENDED", // Заблокирован
}

// Типы столиков
export enum TableType {
  INDOOR = "INDOOR", // В помещении
  OUTDOOR = "OUTDOOR", // На улице
  PRIVATE = "PRIVATE", // Приватная зона
  BAR = "BAR", // Барная стойка
  VIP = "VIP", // VIP зона
}

// Базовый интерфейс для документов Appwrite
export interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

// Пользователь
export interface User extends BaseDocument {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  preferences?: UserPreferences;
}

// Предпочтения пользователя
export interface UserPreferences {
  favoriteRestaurants: string[];
  dietaryRestrictions: string[];
  preferredCuisines: CuisineType[];
  notificationsEnabled: boolean;
}

// Ресторан
export interface Restaurant extends BaseDocument {
  name: string;
  description: string;
  ownerId: string;
  status: RestaurantStatus;

  // Основная информация
  address: Address;
  phone: string;
  email: string;
  website?: string;

  // Характеристики
  cuisineType: CuisineType[];
  priceRange: PriceRange;
  rating: number;
  reviewCount: number;

  // Медиа
  images: string[];
  logo?: string;

  // Время работы
  workingHours: WorkingHours;

  // Настройки бронирования
  bookingSettings: BookingSettings;

  // Дополнительные удобства
  amenities: string[];

  // Рейтинг и отзывы
  averageRating: number;
  totalReviews: number;
}

// Адрес
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Время работы
export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "22:00"
  breakStart?: string; // "14:00"
  breakEnd?: string; // "17:00"
}

// Настройки бронирования
export interface BookingSettings {
  isOnlineBookingEnabled: boolean;
  maxAdvanceBookingDays: number; // Максимум дней для бронирования заранее
  minAdvanceBookingHours: number; // Минимум часов для бронирования заранее
  maxPartySize: number;
  requirePhoneConfirmation: boolean;
  autoConfirmBookings: boolean;
  cancellationPolicy: string;
}

// Столик
export interface Table extends BaseDocument {
  restaurantId: string;
  tableNumber: string;
  capacity: number;
  type: TableType;
  isActive: boolean;
  location?: string; // Описание расположения ("У окна", "Зал А")
  amenities?: string[]; // ["Детский стульчик", "Розетка"]
}

// Бронирование
export interface Booking extends BaseDocument {
  restaurantId: string;
  customerId: string;
  tableId: string;

  // Детали бронирования
  date: string; // "2024-12-25"
  timeSlot: string; // "19:00"
  duration: number; // Продолжительность в минутах
  partySize: number;

  // Статус
  status: BookingStatus;

  // Контактная информация
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Дополнительная информация
  specialRequests?: string;
  notes?: string; // Заметки ресторана

  // Подтверждение
  confirmationCode: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

// Отзыв
export interface Review extends BaseDocument {
  restaurantId: string;
  customerId: string;
  bookingId?: string;

  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];

  // Рейтинги по категориям
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  valueRating?: number;

  // Модерация
  isApproved: boolean;
  moderatedBy?: string;
  moderatedAt?: string;
}

// Временной слот
export interface TimeSlot {
  time: string; // "19:00"
  availableTables: number;
  totalTables: number;
  isAvailable: boolean;
}

// Доступность столиков
export interface TableAvailability {
  date: string;
  timeSlots: TimeSlot[];
}

// DTO для создания ресторана
export interface CreateRestaurantDto {
  name: string;
  description: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  cuisineType: CuisineType[];
  priceRange: PriceRange;
  images: string[];
  workingHours: WorkingHours;
  bookingSettings: BookingSettings;
  amenities: string[];
}

// DTO для создания бронирования
export interface CreateBookingDto {
  restaurantId: string;
  tableId: string;
  date: string;
  timeSlot: string;
  partySize: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
}

// Фильтры для поиска ресторанов
export interface RestaurantFilters {
  city?: string;
  cuisineType?: CuisineType[];
  priceRange?: PriceRange[];
  rating?: number; // Минимальный рейтинг
  isOpenNow?: boolean;
  hasAvailableTables?: boolean;
  date?: string;
  time?: string;
  partySize?: number;
  amenities?: string[];
  searchQuery?: string;
}

// Фильтры для бронирований
export interface BookingFilters {
  restaurantId?: string;
  customerId?: string;
  status?: BookingStatus[];
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

// Статистика для ресторана
export interface RestaurantStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShows: number;
  averageRating: number;
  totalReviews: number;
  popularTimeSlots: { time: string; bookings: number }[];
  monthlyBookings: { month: string; count: number }[];
  revenueEstimate?: number;
}

// Общая статистика платформы
export interface PlatformStats {
  totalUsers: number;
  totalRestaurants: number;
  totalBookings: number;
  activeRestaurants: number;
  pendingRestaurants: number;
  totalReviews: number;
  averagePlatformRating: number;
  bookingsByStatus: { [status in BookingStatus]: number };
  topCuisines: { cuisine: CuisineType; count: number }[];
  monthlyGrowth: {
    users: number;
    restaurants: number;
    bookings: number;
  };
}

// Настройки уведомлений
export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingConfirmations: boolean;
  bookingReminders: boolean;
  promotionalOffers: boolean;
  reviewRequests: boolean;
}

// Ответы API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  documents: T[];
  total: number;
  offset: number;
  limit: number;
}

// Утилитарные функции для лейблов
export const getCuisineTypeLabel = (cuisine: CuisineType): string => {
  const labels: Record<CuisineType, string> = {
    [CuisineType.ITALIAN]: "Итальянская",
    [CuisineType.JAPANESE]: "Японская",
    [CuisineType.CHINESE]: "Китайская",
    [CuisineType.FRENCH]: "Французская",
    [CuisineType.INDIAN]: "Индийская",
    [CuisineType.MEXICAN]: "Мексиканская",
    [CuisineType.THAI]: "Тайская",
    [CuisineType.AMERICAN]: "Американская",
    [CuisineType.MEDITERRANEAN]: "Средиземноморская",
    [CuisineType.FUSION]: "Фьюжн",
    [CuisineType.OTHER]: "Другое",
  };
  return labels[cuisine];
};

export const getPriceRangeLabel = (range: PriceRange): string => {
  const labels: Record<PriceRange, string> = {
    [PriceRange.BUDGET]: "Бюджетно ($)",
    [PriceRange.MODERATE]: "Умеренно ($$)",
    [PriceRange.EXPENSIVE]: "Дорого ($$$)",
    [PriceRange.LUXURY]: "Люкс ($$$$)",
  };
  return labels[range];
};

export const getBookingStatusLabel = (status: BookingStatus): string => {
  const labels: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: "Ожидает подтверждения",
    [BookingStatus.CONFIRMED]: "Подтверждено",
    [BookingStatus.CANCELLED]: "Отменено",
    [BookingStatus.COMPLETED]: "Завершено",
    [BookingStatus.NO_SHOW]: "Не явился",
  };
  return labels[status];
};

export const getRestaurantStatusLabel = (status: RestaurantStatus): string => {
  const labels: Record<RestaurantStatus, string> = {
    [RestaurantStatus.PENDING]: "На модерации",
    [RestaurantStatus.APPROVED]: "Одобрен",
    [RestaurantStatus.REJECTED]: "Отклонен",
    [RestaurantStatus.SUSPENDED]: "Заблокирован",
  };
  return labels[status];
};

export const getTableTypeLabel = (type: TableType): string => {
  const labels: Record<TableType, string> = {
    [TableType.INDOOR]: "В помещении",
    [TableType.OUTDOOR]: "На улице",
    [TableType.PRIVATE]: "Приватная зона",
    [TableType.BAR]: "Барная стойка",
    [TableType.VIP]: "VIP зона",
  };
  return labels[type];
};
