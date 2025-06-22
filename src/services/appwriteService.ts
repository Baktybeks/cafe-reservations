// src/services/appwriteService.ts

import { Client, Account, Databases, ID, Query } from "appwrite";
import { appwriteConfig } from "@/constants/appwriteConfig";
import {
  User,
  UserRole,
  Restaurant,
  Table,
  Booking,
  Review,
  CreateRestaurantDto,
  CreateBookingDto,
  RestaurantStatus,
  BookingStatus,
} from "@/types";

// Создание клиента Appwrite
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

const account = new Account(client);
const databases = new Databases(client);

// Маппинг документов
const mapUserDocument = (doc: any): User => ({
  $id: doc.$id,
  $createdAt: doc.$createdAt,
  $updatedAt: doc.$updatedAt,
  name: doc.name,
  email: doc.email,
  phone: doc.phone,
  role: doc.role as UserRole,
  isActive: doc.isActive,
  avatar: doc.avatar,
  preferences: doc.preferences,
});

const mapRestaurantDocument = (doc: any): Restaurant => ({
  $id: doc.$id,
  $createdAt: doc.$createdAt,
  $updatedAt: doc.$updatedAt,
  name: doc.name,
  description: doc.description,
  ownerId: doc.ownerId,
  status: doc.status as RestaurantStatus,
  address: doc.address,
  phone: doc.phone,
  email: doc.email,
  website: doc.website,
  cuisineType: doc.cuisineType,
  priceRange: doc.priceRange,
  rating: doc.rating || 0,
  reviewCount: doc.reviewCount || 0,
  images: doc.images || [],
  logo: doc.logo,
  workingHours: doc.workingHours,
  bookingSettings: doc.bookingSettings,
  amenities: doc.amenities || [],
  averageRating: doc.averageRating || 0,
  totalReviews: doc.totalReviews || 0,
});

const mapBookingDocument = (doc: any): Booking => ({
  $id: doc.$id,
  $createdAt: doc.$createdAt,
  $updatedAt: doc.$updatedAt,
  restaurantId: doc.restaurantId,
  customerId: doc.customerId,
  tableId: doc.tableId,
  date: doc.date,
  timeSlot: doc.timeSlot,
  duration: doc.duration,
  partySize: doc.partySize,
  status: doc.status as BookingStatus,
  customerName: doc.customerName,
  customerEmail: doc.customerEmail,
  customerPhone: doc.customerPhone,
  specialRequests: doc.specialRequests,
  notes: doc.notes,
  confirmationCode: doc.confirmationCode,
  confirmedAt: doc.confirmedAt,
  cancelledAt: doc.cancelledAt,
  cancelReason: doc.cancelReason,
});

// === АУТЕНТИФИКАЦИЯ ===

export const createAccount = async (
  name: string,
  email: string,
  password: string
) => {
  try {
    const response = await account.create(ID.unique(), email, password, name);
    return response;
  } catch (error: any) {
    console.error("Ошибка создания аккаунта:", error);
    if (error.code === 409) {
      throw new Error("Пользователь с таким email уже существует");
    }
    throw new Error(error.message || "Ошибка при создании аккаунта");
  }
};

export const createSession = async (email: string, password: string) => {
  try {
    const response = await account.createEmailPasswordSession(email, password);
    return response;
  } catch (error: any) {
    console.error("Ошибка создания сессии:", error);
    if (error.code === 401) {
      throw new Error("Неверный email или пароль");
    }
    throw new Error(error.message || "Ошибка при входе в систему");
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await account.get();
    return response;
  } catch (error: any) {
    if (error.code === 401) {
      return null;
    }
    console.error("Ошибка получения текущего пользователя:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    await account.deleteSession("current");
  } catch (error: any) {
    console.error("Ошибка при выходе:", error);
  }
};

// === ПОЛЬЗОВАТЕЛИ ===

export const createUserDocument = async (
  userId: string,
  userData: Omit<User, "$id" | "$updatedAt">
) => {
  try {
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      userId,
      {
        ...userData,
        createdAt: userData.$createdAt || new Date().toISOString(),
      }
    );
    return mapUserDocument(response);
  } catch (error: any) {
    console.error("Ошибка создания документа пользователя:", error);
    throw new Error(
      error.message || "Ошибка при создании профиля пользователя"
    );
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      userId
    );
    return mapUserDocument(response);
  } catch (error: any) {
    console.error("Ошибка получения пользователя:", error);
    if (error.code === 404) {
      return null;
    }
    throw new Error(
      error.message || "Ошибка при получении данных пользователя"
    );
  }
};

export const updateUserDocument = async (
  userId: string,
  updates: Partial<User>
): Promise<User | null> => {
  try {
    const { $id, $createdAt, $updatedAt, ...updateData } = updates;
    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      userId,
      updateData
    );
    return mapUserDocument(response);
  } catch (error: any) {
    console.error("Ошибка обновления пользователя:", error);
    throw new Error(error.message || "Ошибка при обновлении профиля");
  }
};

export const getUsers = async (queries: string[] = []): Promise<User[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.users,
      queries
    );
    return response.documents.map(mapUserDocument);
  } catch (error: any) {
    console.error("Ошибка получения списка пользователей:", error);
    throw new Error(
      error.message || "Ошибка при получении списка пользователей"
    );
  }
};

// === РЕСТОРАНЫ ===

export const createRestaurant = async (
  restaurantData: CreateRestaurantDto,
  ownerId: string
) => {
  try {
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.restaurants,
      ID.unique(),
      {
        ...restaurantData,
        ownerId,
        status: RestaurantStatus.PENDING,
        rating: 0,
        reviewCount: 0,
        averageRating: 0,
        totalReviews: 0,
        createdAt: new Date().toISOString(),
      }
    );
    return mapRestaurantDocument(response);
  } catch (error: any) {
    console.error("Ошибка создания ресторана:", error);
    throw new Error(error.message || "Ошибка при создании ресторана");
  }
};

export const getRestaurants = async (
  queries: string[] = []
): Promise<Restaurant[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.restaurants,
      queries
    );
    return response.documents.map(mapRestaurantDocument);
  } catch (error: any) {
    console.error("Ошибка получения ресторанов:", error);
    throw new Error(error.message || "Ошибка при получении ресторанов");
  }
};

export const getRestaurantById = async (
  restaurantId: string
): Promise<Restaurant | null> => {
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.restaurants,
      restaurantId
    );
    return mapRestaurantDocument(response);
  } catch (error: any) {
    console.error("Ошибка получения ресторана:", error);
    if (error.code === 404) {
      return null;
    }
    throw new Error(error.message || "Ошибка при получении ресторана");
  }
};

export const updateRestaurant = async (
  restaurantId: string,
  updates: Partial<Restaurant>
): Promise<Restaurant | null> => {
  try {
    const { $id, $createdAt, $updatedAt, ...updateData } = updates;
    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.restaurants,
      restaurantId,
      updateData
    );
    return mapRestaurantDocument(response);
  } catch (error: any) {
    console.error("Ошибка обновления ресторана:", error);
    throw new Error(error.message || "Ошибка при обновлении ресторана");
  }
};

// === СТОЛИКИ ===

export const getTables = async (queries: string[] = []): Promise<Table[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.tables,
      queries
    );
    return response.documents as unknown as Table[];
  } catch (error: any) {
    console.error("Ошибка получения столиков:", error);
    throw new Error(error.message || "Ошибка при получении столиков");
  }
};

export const getRestaurantTables = async (
  restaurantId: string
): Promise<Table[]> => {
  return getTables([Query.equal("restaurantId", restaurantId)]);
};

// === БРОНИРОВАНИЯ ===

export const createBooking = async (
  bookingData: CreateBookingDto,
  customerId: string
) => {
  try {
    const confirmationCode = Math.random()
      .toString(36)
      .substr(2, 8)
      .toUpperCase();

    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.bookings,
      ID.unique(),
      {
        ...bookingData,
        customerId,
        status: BookingStatus.PENDING,
        confirmationCode,
        duration: 120, // 2 часа по умолчанию
        createdAt: new Date().toISOString(),
      }
    );
    return mapBookingDocument(response);
  } catch (error: any) {
    console.error("Ошибка создания бронирования:", error);
    throw new Error(error.message || "Ошибка при создании бронирования");
  }
};

export const getBookings = async (
  queries: string[] = []
): Promise<Booking[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.bookings,
      queries
    );
    return response.documents.map(mapBookingDocument);
  } catch (error: any) {
    console.error("Ошибка получения бронирований:", error);
    throw new Error(error.message || "Ошибка при получении бронирований");
  }
};

export const getUserBookings = async (
  customerId: string
): Promise<Booking[]> => {
  return getBookings([
    Query.equal("customerId", customerId),
    Query.orderDesc("$createdAt"),
  ]);
};

export const getRestaurantBookings = async (
  restaurantId: string
): Promise<Booking[]> => {
  return getBookings([
    Query.equal("restaurantId", restaurantId),
    Query.orderDesc("$createdAt"),
  ]);
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
  notes?: string
): Promise<Booking | null> => {
  try {
    const updates: any = { status };

    if (status === BookingStatus.CONFIRMED) {
      updates.confirmedAt = new Date().toISOString();
    } else if (status === BookingStatus.CANCELLED) {
      updates.cancelledAt = new Date().toISOString();
      if (notes) updates.cancelReason = notes;
    }

    if (notes) updates.notes = notes;

    const response = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collections.bookings,
      bookingId,
      updates
    );
    return mapBookingDocument(response);
  } catch (error: any) {
    console.error("Ошибка обновления статуса бронирования:", error);
    throw new Error(error.message || "Ошибка при обновлении бронирования");
  }
};

// === ОТЗЫВЫ ===

export const getRestaurantReviews = async (
  restaurantId: string
): Promise<Review[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collections.reviews,
      [
        Query.equal("restaurantId", restaurantId),
        Query.equal("isApproved", true),
        Query.orderDesc("$createdAt"),
      ]
    );
    return response.documents as unknown as Review[];
  } catch (error: any) {
    console.error("Ошибка получения отзывов:", error);
    throw new Error(error.message || "Ошибка при получении отзывов");
  }
};

// === СТАТИСТИКА ===

export const getRestaurantStats = async (restaurantId: string) => {
  try {
    const bookings = await getRestaurantBookings(restaurantId);
    const reviews = await getRestaurantReviews(restaurantId);

    return {
      totalBookings: bookings.length,
      completedBookings: bookings.filter(
        (b) => b.status === BookingStatus.COMPLETED
      ).length,
      cancelledBookings: bookings.filter(
        (b) => b.status === BookingStatus.CANCELLED
      ).length,
      noShows: bookings.filter((b) => b.status === BookingStatus.NO_SHOW)
        .length,
      averageRating:
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : 0,
      totalReviews: reviews.length,
    };
  } catch (error: any) {
    console.error("Ошибка получения статистики ресторана:", error);
    throw new Error(error.message || "Ошибка при получении статистики");
  }
};

// Экспорт объекта с функциями
export const appwriteService = {
  // Auth
  createAccount,
  createSession,
  getCurrentUser,
  logout,

  // Users
  createUserDocument,
  getUserById,
  updateUserDocument,
  getUsers,

  // Restaurants
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,

  // Tables
  getTables,
  getRestaurantTables,

  // Bookings
  createBooking,
  getBookings,
  getUserBookings,
  getRestaurantBookings,
  updateBookingStatus,

  // Reviews
  getRestaurantReviews,

  // Stats
  getRestaurantStats,
};

export default appwriteService;
