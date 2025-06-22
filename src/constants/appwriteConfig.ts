// src/constants/appwriteConfig.ts

export const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",

  collections: {
    users: process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users",
    restaurants:
      process.env.NEXT_PUBLIC_RESTAURANTS_COLLECTION_ID || "restaurants",
    tables: process.env.NEXT_PUBLIC_TABLES_COLLECTION_ID || "tables",
    bookings: process.env.NEXT_PUBLIC_BOOKINGS_COLLECTION_ID || "bookings",
    reviews: process.env.NEXT_PUBLIC_REVIEWS_COLLECTION_ID || "reviews",
  },
};

// Проверка конфигурации
export const validateAppwriteConfig = () => {
  const requiredFields = ["endpoint", "projectId", "databaseId"];

  for (const field of requiredFields) {
    if (!appwriteConfig[field as keyof typeof appwriteConfig]) {
      throw new Error(`Missing Appwrite configuration: ${field}`);
    }
  }

  console.log("✅ Appwrite configuration validated");
  return true;
};
