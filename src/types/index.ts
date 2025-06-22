// src/types/index.ts - Оптимизированные типы для приложения бронирования ресторанов

// ===== ENUMS =====

export enum UserRole {
  ADMIN = "ADMIN",
  RESTAURANT_OWNER = "RESTAURANT_OWNER",
  CUSTOMER = "CUSTOMER",
}

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

export enum PriceRange {
  BUDGET = "BUDGET", // $
  MODERATE = "MODERATE", // $$
  EXPENSIVE = "EXPENSIVE", // $$$
  LUXURY = "LUXURY", // $$$$
}

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

export enum RestaurantStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export enum TableType {
  INDOOR = "INDOOR",
  OUTDOOR = "OUTDOOR",
  PRIVATE = "PRIVATE",
  BAR = "BAR",
  VIP = "VIP",
}

// ===== BASE INTERFACES =====

export interface BaseDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

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

export interface DayHours {
  isOpen: boolean;
  openTime?: string; // "09:00"
  closeTime?: string; // "22:00"
  breakStart?: string; // "14:00"
  breakEnd?: string; // "17:00"
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

// ===== USER TYPES =====

export interface UserPreferences {
  favoriteRestaurants: string[];
  dietaryRestrictions: string[];
  preferredCuisines: CuisineType[];
  notificationsEnabled: boolean;
}

export interface User extends BaseDocument {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  preferences?: UserPreferences;
}

// ===== RESTAURANT TYPES =====

export interface BookingSettings {
  isOnlineBookingEnabled: boolean;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  maxPartySize: number;
  requirePhoneConfirmation: boolean;
  autoConfirmBookings: boolean;
  cancellationPolicy: string;
}

export interface Restaurant extends BaseDocument {
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  status: RestaurantStatus;

  // Контактная информация
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

  // Операционные настройки
  workingHours: WorkingHours;
  bookingSettings: BookingSettings;
  capacity: number;
  amenities: string[];

  // Модерация
  isActive: boolean;
  moderationNote?: string;
}

// ===== TABLE TYPES =====

export interface Table extends BaseDocument {
  restaurantId: string;
  number: string;
  capacity: number;
  type: TableType;
  location?: string;
  amenities?: string[];
  isActive: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  capacity: number;
  bookedCount: number;
  price?: number;
}

export interface TableAvailability {
  date: string;
  timeSlots: TimeSlot[];
  totalTables: number;
  availableTables: number;
  restaurant: Pick<Restaurant, "$id" | "name" | "capacity">;
}

// ===== BOOKING TYPES =====

export interface Booking extends BaseDocument {
  // Связи
  restaurantId: string;
  customerId: string;
  tableId?: string;

  // Детали бронирования
  date: string; // "2024-12-25"
  time: string; // "19:00"
  duration: number; // Продолжительность в минутах
  guestCount: number;
  status: BookingStatus;

  // Контактная информация
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Дополнительная информация
  specialRequests?: string;
  notes?: string;
  totalAmount?: number;

  // Системная информация
  confirmationCode: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;

  // Денормализованные данные для удобства
  restaurantName?: string;
}

// ===== REVIEW TYPES =====

export interface Review extends BaseDocument {
  restaurantId: string;
  customerId: string;
  bookingId?: string;

  // Рейтинги
  rating: number; // 1-5
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  valueRating?: number;

  // Контент
  title?: string;
  comment: string;
  images?: string[];

  // Модерация
  isApproved: boolean;
  moderatedBy?: string;
  moderatedAt?: string;
}

// ===== DTO TYPES =====

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

export interface CreateBookingDto {
  restaurantId: string;
  tableId?: string;
  date: string;
  time: string;
  guestCount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
  reservationToken?: string;
}

export interface BookingUpdate {
  status?: BookingStatus;
  tableId?: string;
  notes?: string;
  cancelReason?: string;
}

// ===== FILTER TYPES =====

export interface RestaurantFilters {
  city?: string;
  cuisineType?: CuisineType[];
  priceRange?: PriceRange[];
  rating?: number;
  isOpenNow?: boolean;
  hasAvailableTables?: boolean;
  date?: string;
  time?: string;
  guestCount?: number;
  amenities?: string[];
  searchQuery?: string;
  showAll?: boolean;
}

export interface BookingFilters {
  restaurantId?: string;
  customerId?: string;
  status?: BookingStatus | BookingStatus[] | "all";
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface AvailabilityQuery {
  restaurantId: string;
  date: string;
  guestCount?: number;
  timeFrom?: string;
  timeTo?: string;
}

// ===== STATISTICS TYPES =====

export interface BookingStats {
  total: number;
  upcoming: number;
  past: number;
  cancelled: number;
}

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

export interface PlatformStats {
  totalUsers: number;
  totalRestaurants: number;
  totalBookings: number;
  activeRestaurants: number;
  pendingRestaurants: number;
  totalReviews: number;
  averagePlatformRating: number;
  bookingsByStatus: Record<BookingStatus, number>;
  topCuisines: { cuisine: CuisineType; count: number }[];
  monthlyGrowth: {
    users: number;
    restaurants: number;
    bookings: number;
  };
}

// ===== NOTIFICATION TYPES =====

export interface BookingNotification extends BaseDocument {
  bookingId: string;
  userId: string;
  type: "confirmation" | "reminder" | "cancellation" | "update";
  message: string;
  isRead: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingConfirmations: boolean;
  bookingReminders: boolean;
  promotionalOffers: boolean;
  reviewRequests: boolean;
}

// ===== API RESPONSE TYPES =====

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

// ===== EXTENDED TYPES =====

export type BookingWithRestaurant = Booking & {
  restaurant: Pick<Restaurant, "name" | "phone" | "address" | "images">;
};

export type RestaurantWithStats = Restaurant & {
  stats: RestaurantStats;
};

// ===== UTILITY FUNCTIONS =====

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
    [BookingStatus.COMPLETED]: "Завершено",
    [BookingStatus.CANCELLED]: "Отменено",
    [BookingStatus.NO_SHOW]: "Не явился",
  };
  return labels[status];
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  const colors: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: "orange",
    [BookingStatus.CONFIRMED]: "blue",
    [BookingStatus.COMPLETED]: "green",
    [BookingStatus.CANCELLED]: "red",
    [BookingStatus.NO_SHOW]: "red",
  };
  return colors[status];
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

export const formatPrice = (amount: number, currency = "RUB"): string => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
  }).format(amount);
};

export const isBookingEditable = (booking: Booking): boolean => {
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  const now = new Date();
  const hoursUntilBooking =
    (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  return (
    hoursUntilBooking > 2 &&
    [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)
  );
};

export const isBookingCancellable = (booking: Booking): boolean => {
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  const now = new Date();
  const hoursUntilBooking =
    (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  return (
    hoursUntilBooking > 1 &&
    [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)
  );
};

export const generateConfirmationCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatTime = (timeString: string): string => {
  return timeString.substring(0, 5); // "19:00:00" -> "19:00"
};
