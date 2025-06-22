// scripts/testConnection.js - Тестирование подключения к Appwrite

const { Client, Databases, Account } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const appwriteConfig = {
  endpoint:
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  apiKey: process.env.APPWRITE_API_KEY || "",
};

const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setKey(appwriteConfig.apiKey);

const databases = new Databases(client);
const account = new Account(client);

async function testConnection() {
  console.log("🔧 RestaurantBooking - Тест подключения к Appwrite\n");

  // Проверяем переменные окружения
  console.log("📋 Проверка конфигурации:");
  console.log(`   Endpoint: ${appwriteConfig.endpoint}`);
  console.log(
    `   Project ID: ${
      appwriteConfig.projectId ? "✅ Найден" : "❌ Отсутствует"
    }`
  );
  console.log(
    `   Database ID: ${
      appwriteConfig.databaseId ? "✅ Найден" : "❌ Отсутствует"
    }`
  );
  console.log(
    `   API Key: ${appwriteConfig.apiKey ? "✅ Найден" : "❌ Отсутствует"}\n`
  );

  if (
    !appwriteConfig.projectId ||
    !appwriteConfig.databaseId ||
    !appwriteConfig.apiKey
  ) {
    console.error("❌ Отсутствуют обязательные переменные окружения!");
    console.log("\n💡 Создайте файл .env.local со следующими переменными:");
    console.log("   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id");
    console.log("   NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id");
    console.log("   APPWRITE_API_KEY=your_api_key");
    return;
  }

  try {
    // Тест 1: Подключение к проекту
    console.log("🔌 Тест 1: Подключение к проекту...");
    const health = await fetch(`${appwriteConfig.endpoint}/health`);
    if (health.ok) {
      console.log("   ✅ Appwrite сервер доступен");
    } else {
      console.log("   ❌ Appwrite сервер недоступен");
      return;
    }

    // Тест 2: Проверка API ключа
    console.log("\n🔑 Тест 2: Проверка API ключа...");
    try {
      const database = await databases.get(appwriteConfig.databaseId);
      console.log(`   ✅ База данных найдена: ${database.name}`);
    } catch (error) {
      console.log(`   ❌ Ошибка доступа к базе данных: ${error.message}`);
      return;
    }

    // Тест 3: Проверка коллекций
    console.log("\n📚 Тест 3: Проверка коллекций...");
    const requiredCollections = [
      "users",
      "restaurants",
      "tables",
      "bookings",
      "reviews",
    ];

    try {
      const collections = await databases.listCollections(
        appwriteConfig.databaseId
      );
      console.log(`   📊 Найдено коллекций: ${collections.collections.length}`);

      for (const collectionName of requiredCollections) {
        const found = collections.collections.find(
          (c) => c.name === collectionName
        );
        if (found) {
          console.log(`   ✅ ${collectionName} (ID: ${found.$id})`);
        } else {
          console.log(`   ❌ ${collectionName} - не найдена`);
        }
      }

      const missingCollections = requiredCollections.filter(
        (name) => !collections.collections.find((c) => c.name === name)
      );

      if (missingCollections.length > 0) {
        console.log(
          `\n⚠️  Отсутствующие коллекции: ${missingCollections.join(", ")}`
        );
        console.log("💡 Запустите: npm run db:setup");
      }
    } catch (error) {
      console.log(`   ❌ Ошибка получения коллекций: ${error.message}`);
      return;
    }

    // Тест 4: Проверка прав доступа
    console.log("\n🛡️  Тест 4: Проверка прав доступа...");
    try {
      // Пробуем создать тестовый документ (если коллекция users существует)
      const usersCollection = await databases.listCollections(
        appwriteConfig.databaseId
      );
      const usersCol = usersCollection.collections.find(
        (c) => c.name === "users"
      );

      if (usersCol) {
        try {
          const testDoc = await databases.createDocument(
            appwriteConfig.databaseId,
            usersCol.$id,
            "test-connection",
            {
              name: "Test User",
              email: "test@example.com",
              role: "CUSTOMER",
              isActive: false,
              createdAt: new Date().toISOString(),
            }
          );

          // Сразу удаляем тестовый документ
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            usersCol.$id,
            testDoc.$id
          );

          console.log("   ✅ Права на запись - OK");
        } catch (error) {
          if (error.code === 409) {
            console.log("   ✅ Права на запись - OK (документ уже существует)");
          } else {
            console.log(
              `   ⚠️  Ограниченные права на запись: ${error.message}`
            );
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Не удалось проверить права: ${error.message}`);
    }

    // Тест 5: Проверка производительности
    console.log("\n⚡ Тест 5: Проверка производительности...");
    const startTime = Date.now();
    try {
      await databases.get(appwriteConfig.databaseId);
      const responseTime = Date.now() - startTime;
      console.log(`   ✅ Время ответа: ${responseTime}ms`);

      if (responseTime < 500) {
        console.log("   🚀 Отличная производительность!");
      } else if (responseTime < 1000) {
        console.log("   👍 Хорошая производительность");
      } else {
        console.log("   ⚠️  Медленное соединение");
      }
    } catch (error) {
      console.log(
        `   ❌ Ошибка при тесте производительности: ${error.message}`
      );
    }

    console.log("\n🎉 Тестирование завершено!");
    console.log("\n📝 Следующие шаги:");
    console.log("   1. Если есть недостающие коллекции: npm run db:setup");
    console.log("   2. Запустить приложение: npm run dev");
    console.log("   3. Открыть: http://localhost:3000");
  } catch (error) {
    console.error("\n💥 Критическая ошибка:", error.message);
    console.log("\n🔍 Проверьте:");
    console.log("   - Правильность переменных окружения");
    console.log("   - Доступность интернета");
    console.log("   - Статус проекта в Appwrite Console");
    console.log("   - Права API ключа");
  }
}

// Дополнительная функция для проверки структуры коллекций
async function checkCollectionStructure() {
  console.log("\n🔍 Детальная проверка структуры коллекций:\n");

  const requiredCollections = {
    users: ["name", "email", "role", "isActive"],
    restaurants: ["name", "description", "ownerId", "status", "address"],
    tables: ["restaurantId", "tableNumber", "capacity", "type"],
    bookings: ["restaurantId", "customerId", "tableId", "date", "timeSlot"],
    reviews: ["restaurantId", "customerId", "rating", "comment"],
  };

  try {
    const collections = await databases.listCollections(
      appwriteConfig.databaseId
    );

    for (const [collectionName, requiredAttributes] of Object.entries(
      requiredCollections
    )) {
      const collection = collections.collections.find(
        (c) => c.name === collectionName
      );

      if (collection) {
        console.log(`📋 ${collectionName}:`);

        try {
          const attributes = await databases.listAttributes(
            appwriteConfig.databaseId,
            collection.$id
          );

          for (const attrName of requiredAttributes) {
            const found = attributes.attributes.find((a) => a.key === attrName);
            if (found) {
              console.log(`   ✅ ${attrName} (${found.type})`);
            } else {
              console.log(`   ❌ ${attrName} - отсутствует`);
            }
          }

          console.log(`   📊 Всего атрибутов: ${attributes.attributes.length}`);
        } catch (error) {
          console.log(`   ❌ Ошибка получения атрибутов: ${error.message}`);
        }
      } else {
        console.log(`📋 ${collectionName}: ❌ Коллекция не найдена`);
      }
      console.log("");
    }
  } catch (error) {
    console.error("Ошибка при проверке структуры:", error.message);
  }
}

// Функция для получения статистики
async function getStatistics() {
  console.log("\n📊 Статистика базы данных:\n");

  try {
    const collections = await databases.listCollections(
      appwriteConfig.databaseId
    );

    for (const collection of collections.collections) {
      try {
        const documents = await databases.listDocuments(
          appwriteConfig.databaseId,
          collection.$id,
          undefined,
          1 // Получаем только 1 документ для подсчета
        );

        console.log(`📚 ${collection.name}: ${documents.total} документов`);
      } catch (error) {
        console.log(
          `📚 ${collection.name}: Ошибка подсчета (${error.message})`
        );
      }
    }
  } catch (error) {
    console.error("Ошибка получения статистики:", error.message);
  }
}

// Главная функция
async function main() {
  const command = process.argv[2];

  switch (command) {
    case "structure":
      await checkCollectionStructure();
      break;
    case "stats":
      await getStatistics();
      break;
    case "full":
      await testConnection();
      await checkCollectionStructure();
      await getStatistics();
      break;
    default:
      await testConnection();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testConnection,
  checkCollectionStructure,
  getStatistics,
};
