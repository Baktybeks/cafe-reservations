// scripts/setupCollections.js - Настройка коллекций для системы бронирования ресторанов

const { Client, Databases, Permission, Role } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const appwriteConfig = {
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

const COLLECTION_SCHEMAS = {
  users: {
    name: { type: "string", required: true, size: 255 },
    email: { type: "email", required: true, size: 320 },
    phone: { type: "string", required: false, size: 50 },
    role: {
      type: "enum",
      required: true,
      elements: ["ADMIN", "RESTAURANT_OWNER", "CUSTOMER"],
    },
    isActive: { type: "boolean", required: false, default: false },
    avatar: { type: "url", required: false, size: 500 },
    preferences: { type: "string", required: false, size: 2000 }, // JSON строка
    createdAt: { type: "datetime", required: true },
  },

  restaurants: {
    name: { type: "string", required: true, size: 255 },
    description: { type: "string", required: true, size: 5000 },
    ownerId: { type: "string", required: true, size: 36 },
    status: {
      type: "enum",
      required: true,
      elements: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
      default: "PENDING",
    },

    // Address (JSON строка)
    address: { type: "string", required: true, size: 1000 },
    phone: { type: "string", required: true, size: 50 },
    email: { type: "email", required: true, size: 320 },
    website: { type: "url", required: false, size: 500 },

    // Characteristics
    cuisineType: { type: "string", required: true, array: true },
    priceRange: {
      type: "enum",
      required: true,
      elements: ["BUDGET", "MODERATE", "EXPENSIVE", "LUXURY"],
    },
    rating: { type: "float", required: false, default: 0 },
    reviewCount: { type: "integer", required: false, default: 0 },

    // Media
    images: { type: "string", required: false, array: true },
    logo: { type: "url", required: false, size: 500 },

    // Working hours (JSON строка)
    workingHours: { type: "string", required: true, size: 2000 },

    // Booking settings (JSON строка)
    bookingSettings: { type: "string", required: true, size: 2000 },

    // Amenities
    amenities: { type: "string", required: false, array: true },

    // Ratings
    averageRating: { type: "float", required: false, default: 0 },
    totalReviews: { type: "integer", required: false, default: 0 },

    createdAt: { type: "datetime", required: true },
  },

  tables: {
    restaurantId: { type: "string", required: true, size: 36 },
    tableNumber: { type: "string", required: true, size: 50 },
    capacity: { type: "integer", required: true, min: 1, max: 20 },
    type: {
      type: "enum",
      required: true,
      elements: ["INDOOR", "OUTDOOR", "PRIVATE", "BAR", "VIP"],
    },
    isActive: { type: "boolean", required: false, default: true },
    location: { type: "string", required: false, size: 255 },
    amenities: { type: "string", required: false, array: true },
    createdAt: { type: "datetime", required: true },
  },

  bookings: {
    restaurantId: { type: "string", required: true, size: 36 },
    customerId: { type: "string", required: true, size: 36 },
    tableId: { type: "string", required: true, size: 36 },

    // Booking details
    date: { type: "string", required: true, size: 10 }, // "2024-12-25"
    timeSlot: { type: "string", required: true, size: 5 }, // "19:00"
    duration: { type: "integer", required: true, min: 30, max: 480 }, // minutes
    partySize: { type: "integer", required: true, min: 1, max: 20 },

    // Status
    status: {
      type: "enum",
      required: true,
      elements: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"],
      default: "PENDING",
    },

    // Customer info
    customerName: { type: "string", required: true, size: 255 },
    customerEmail: { type: "email", required: true, size: 320 },
    customerPhone: { type: "string", required: true, size: 50 },

    // Additional info
    specialRequests: { type: "string", required: false, size: 1000 },
    notes: { type: "string", required: false, size: 1000 },

    // Confirmation
    confirmationCode: { type: "string", required: true, size: 10 },
    confirmedAt: { type: "datetime", required: false },
    cancelledAt: { type: "datetime", required: false },
    cancelReason: { type: "string", required: false, size: 500 },

    createdAt: { type: "datetime", required: true },
  },

  reviews: {
    restaurantId: { type: "string", required: true, size: 36 },
    customerId: { type: "string", required: true, size: 36 },
    bookingId: { type: "string", required: false, size: 36 },

    rating: { type: "integer", required: true, min: 1, max: 5 },
    title: { type: "string", required: false, size: 255 },
    comment: { type: "string", required: true, size: 2000 },
    images: { type: "string", required: false, array: true },

    // Category ratings
    foodRating: { type: "integer", required: false, min: 1, max: 5 },
    serviceRating: { type: "integer", required: false, min: 1, max: 5 },
    ambianceRating: { type: "integer", required: false, min: 1, max: 5 },
    valueRating: { type: "integer", required: false, min: 1, max: 5 },

    // Moderation
    isApproved: { type: "boolean", required: false, default: false },
    moderatedBy: { type: "string", required: false, size: 36 },
    moderatedAt: { type: "datetime", required: false },

    createdAt: { type: "datetime", required: true },
  },
};

const COLLECTION_INDEXES = {
  users: [
    { key: "email", type: "unique" },
    { key: "role", type: "key" },
    { key: "isActive", type: "key" },
    { key: "createdAt", type: "key" },
  ],

  restaurants: [
    { key: "ownerId", type: "key" },
    { key: "status", type: "key" },
    { key: "cuisineType", type: "key" },
    { key: "priceRange", type: "key" },
    { key: "averageRating", type: "key" },
    { key: "createdAt", type: "key" },
  ],

  tables: [
    { key: "restaurantId", type: "key" },
    { key: "isActive", type: "key" },
    { key: "type", type: "key" },
    { key: "capacity", type: "key" },
  ],

  bookings: [
    { key: "restaurantId", type: "key" },
    { key: "customerId", type: "key" },
    { key: "tableId", type: "key" },
    { key: "status", type: "key" },
    { key: "date", type: "key" },
    { key: "timeSlot", type: "key" },
    { key: "confirmationCode", type: "unique" },
    { key: "createdAt", type: "key" },
  ],

  reviews: [
    { key: "restaurantId", type: "key" },
    { key: "customerId", type: "key" },
    { key: "bookingId", type: "key" },
    { key: "rating", type: "key" },
    { key: "isApproved", type: "key" },
    { key: "createdAt", type: "key" },
  ],
};

const client = new Client();
client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const createAttribute = async (databaseId, collectionId, key, schema) => {
  try {
    const attributeType = schema.type;
    let isRequired = schema.required || false;
    let defaultValue = schema.default;

    if (isRequired && defaultValue !== null && defaultValue !== undefined) {
      console.log(
        `    ⚠️ Исправление ${key}: required=true с default значением -> required=false`
      );
      isRequired = false;
    }

    switch (attributeType) {
      case "string":
        return await databases.createStringAttribute(
          databaseId,
          collectionId,
          key,
          schema.size || 255,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "email":
        return await databases.createEmailAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "enum":
        return await databases.createEnumAttribute(
          databaseId,
          collectionId,
          key,
          schema.elements,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "boolean":
        return await databases.createBooleanAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue !== null && defaultValue !== undefined
            ? defaultValue
            : null,
          schema.array || false
        );

      case "datetime":
        return await databases.createDatetimeAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      case "integer":
        return await databases.createIntegerAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          schema.min || null,
          schema.max || null,
          defaultValue || null,
          schema.array || false
        );

      case "float":
        return await databases.createFloatAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          schema.min || null,
          schema.max || null,
          defaultValue || null,
          schema.array || false
        );

      case "url":
        return await databases.createUrlAttribute(
          databaseId,
          collectionId,
          key,
          isRequired,
          defaultValue || null,
          schema.array || false
        );

      default:
        throw new Error(`Неподдерживаемый тип атрибута: ${attributeType}`);
    }
  } catch (error) {
    console.error(`Ошибка создания атрибута ${key}:`, error.message);
    throw error;
  }
};

const createIndex = async (databaseId, collectionId, indexConfig) => {
  try {
    return await databases.createIndex(
      databaseId,
      collectionId,
      indexConfig.key,
      indexConfig.type,
      indexConfig.attributes || [indexConfig.key],
      indexConfig.orders || ["ASC"]
    );
  } catch (error) {
    console.error(`Ошибка создания индекса ${indexConfig.key}:`, error.message);
    throw error;
  }
};

const setupCollections = async () => {
  try {
    console.log(
      "🚀 Начинаем создание коллекций для системы бронирования ресторанов..."
    );
    console.log(
      "📋 Всего коллекций для создания:",
      Object.keys(COLLECTION_SCHEMAS).length
    );

    const databaseId = appwriteConfig.databaseId;

    if (!databaseId) {
      throw new Error("Database ID не найден! Проверьте переменные окружения.");
    }

    for (const [collectionName, schema] of Object.entries(COLLECTION_SCHEMAS)) {
      console.log(`\n📁 Создание коллекции: ${collectionName}`);

      try {
        const collectionId = appwriteConfig.collections[collectionName];

        const collection = await databases.createCollection(
          databaseId,
          collectionId,
          collectionName,
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
          ],
          false
        );

        console.log(
          `  ✅ Коллекция ${collectionName} создана (ID: ${collectionId})`
        );

        console.log(`  📝 Добавление атрибутов...`);
        let attributeCount = 0;

        for (const [attributeKey, attributeSchema] of Object.entries(schema)) {
          try {
            await createAttribute(
              databaseId,
              collectionId,
              attributeKey,
              attributeSchema
            );
            attributeCount++;
            console.log(`    ✅ ${attributeKey} (${attributeSchema.type})`);

            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`    ❌ ${attributeKey}: ${error.message}`);
          }
        }

        console.log(
          `  📊 Создано атрибутов: ${attributeCount}/${
            Object.keys(schema).length
          }`
        );

        if (COLLECTION_INDEXES[collectionName]) {
          console.log(`  🔍 Создание индексов...`);
          let indexCount = 0;

          for (const indexConfig of COLLECTION_INDEXES[collectionName]) {
            try {
              await createIndex(databaseId, collectionId, indexConfig);
              indexCount++;
              console.log(`    ✅ Индекс: ${indexConfig.key}`);

              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (error) {
              console.error(
                `    ❌ Индекс ${indexConfig.key}: ${error.message}`
              );
            }
          }

          console.log(
            `  📈 Создано индексов: ${indexCount}/${COLLECTION_INDEXES[collectionName].length}`
          );
        }
      } catch (error) {
        console.error(
          `❌ Ошибка создания коллекции ${collectionName}:`,
          error.message
        );
      }
    }

    console.log("\n🎉 Настройка коллекций завершена!");
    console.log("🔗 Откройте консоль Appwrite для проверки результата.");
  } catch (error) {
    console.error("💥 Общая ошибка:", error.message);
    console.log("\n🔍 Проверьте:");
    console.log("- Переменные окружения в .env.local");
    console.log("- Права доступа API ключа");
    console.log("- Подключение к интернету");
  }
};

const resetCollections = async () => {
  try {
    console.log("🗑️ Удаление существующих коллекций...");

    const databaseId = appwriteConfig.databaseId;
    let deletedCount = 0;

    for (const [collectionName] of Object.entries(COLLECTION_SCHEMAS)) {
      try {
        const collectionId = appwriteConfig.collections[collectionName];
        await databases.deleteCollection(databaseId, collectionId);
        deletedCount++;
        console.log(`✅ ${collectionName} удалена`);
      } catch (error) {
        console.log(`⚠️ ${collectionName} не найдена или уже удалена`);
      }
    }

    console.log(`🧹 Удалено коллекций: ${deletedCount}`);
  } catch (error) {
    console.error("Ошибка при удалении коллекций:", error.message);
  }
};

const checkEnvironment = () => {
  const required = [
    "NEXT_PUBLIC_APPWRITE_ENDPOINT",
    "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
    "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
    "APPWRITE_API_KEY",
  ];

  const missing = required.filter((env) => !process.env[env]);

  if (missing.length > 0) {
    console.error("❌ Отсутствуют переменные окружения:");
    missing.forEach((env) => console.error(`  - ${env}`));
    console.log("\n💡 Создайте файл .env.local с необходимыми переменными");
    process.exit(1);
  }

  console.log("✅ Все переменные окружения найдены");
};

const main = async () => {
  console.log("🔧 RestaurantBooking - Настройка базы данных\n");

  checkEnvironment();

  const command = process.argv[2];

  switch (command) {
    case "setup":
      await setupCollections();
      break;
    case "reset":
      await resetCollections();
      break;
    case "reset-setup":
      await resetCollections();
      console.log("\n⏳ Ожидание 3 секунды перед созданием...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await setupCollections();
      break;
    default:
      console.log("📖 Использование:");
      console.log(
        "  node scripts/setupCollections.js setup        - Создать коллекции"
      );
      console.log(
        "  node scripts/setupCollections.js reset        - Удалить коллекции"
      );
      console.log(
        "  node scripts/setupCollections.js reset-setup  - Пересоздать коллекции"
      );
      break;
  }
};

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupCollections,
  resetCollections,
  COLLECTION_SCHEMAS,
  COLLECTION_INDEXES,
  appwriteConfig,
};
