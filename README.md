# 🍽️ RestaurantBooking - Система бронирования столиков

Современное веб-приложение для бронирования столиков в ресторанах с полной системой управления для клиентов, владельцев ресторанов и администраторов.

## 🌟 Основные функции

### 👤 Для клиентов

- 🔍 Поиск и фильтрация ресторанов по местоположению, кухне, рейтингу
- 📅 Просмотр доступности столиков в реальном времени
- 🍽️ Онлайн бронирование с выбором даты, времени и количества гостей
- ❤️ Избранные рестораны и история бронирований
- 📱 Уведомления о статусе бронирования

### 🏪 Для владельцев ресторанов

- 🏢 Управление профилем ресторана (меню, фото, часы работы)
- 🪑 Настройка столиков и их расположения
- 📋 Просмотр и управление бронированиями
- 📊 Аналитика и статистика посещений
- ⚙️ Настройки политики бронирования

### 🛡️ Для администраторов

- 👥 Управление пользователями системы
- ✅ Модерация новых ресторанов
- 📈 Просмотр общей статистики платформы
- 🔧 Системные настройки и конфигурация

## 🛠️ Технологический стек

- **Frontend**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS v4 с кастомной конфигурацией
- **Backend**: Appwrite (База данных + Аутентификация + API)
- **State Management**: Zustand для глобального состояния
- **Data Fetching**: TanStack React Query v5
- **UI Components**: Lucide React icons, React DatePicker
- **Notifications**: React Toastify

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- npm/yarn/pnpm
- Аккаунт Appwrite Cloud или локальная установка Appwrite

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/restaurant-booking.git
cd restaurant-booking
```

### 2. Установка зависимостей

```bash
npm install
# или
yarn install
# или
pnpm install
```

### 3. Настройка переменных окружения

Создайте файл `.env.local` на основе `.env.example`:

```bash
cp .env.example .env.local
```

Заполните переменные в `.env.local`:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id

# Appwrite API Key (для серверных операций)
APPWRITE_API_KEY=your_api_key

# Collection IDs
NEXT_PUBLIC_USERS_COLLECTION_ID=users
NEXT_PUBLIC_RESTAURANTS_COLLECTION_ID=restaurants
NEXT_PUBLIC_TABLES_COLLECTION_ID=tables
NEXT_PUBLIC_BOOKINGS_COLLECTION_ID=bookings
NEXT_PUBLIC_REVIEWS_COLLECTION_ID=reviews

# Environment
NODE_ENV=development
```

### 4. Настройка Appwrite

#### Создание проекта в Appwrite

1. Перейдите на [cloud.appwrite.io](https://cloud.appwrite.io)
2. Создайте новый проект
3. Скопируйте Project ID в `.env.local`

#### Создание базы данных

1. В консоли Appwrite создайте новую базу данных
2. Скопируйте Database ID в `.env.local`

#### Настройка коллекций

Запустите скрипт для автоматического создания коллекций:

```bash
npm run db:setup
```

Или создайте коллекции вручную со следующими схемами:

**Users Collection:**

- name (string, required)
- email (email, required)
- phone (string, optional)
- role (enum: ADMIN, RESTAURANT_OWNER, CUSTOMER)
- isActive (boolean, default: false)
- avatar (url, optional)

**Restaurants Collection:**

- name (string, required)
- description (string, required)
- ownerId (string, required)
- status (enum: PENDING, APPROVED, REJECTED, SUSPENDED)
- address (string, required - JSON)
- phone (string, required)
- email (email, required)
- website (url, optional)
- cuisineType (string array, required)
- priceRange (enum: BUDGET, MODERATE, EXPENSIVE, LUXURY)
- images (string array, optional)
- workingHours (string, required - JSON)
- bookingSettings (string, required - JSON)
- amenities (string array, optional)
- averageRating (float, default: 0)
- totalReviews (integer, default: 0)

**Tables Collection:**

- restaurantId (string, required)
- tableNumber (string, required)
- capacity (integer, required, min: 1, max: 20)
- type (enum: INDOOR, OUTDOOR, PRIVATE, BAR, VIP)
- isActive (boolean, default: true)
- location (string, optional)
- amenities (string array, optional)

**Bookings Collection:**

- restaurantId (string, required)
- customerId (string, required)
- tableId (string, required)
- date (string, required) // YYYY-MM-DD
- timeSlot (string, required) // HH:MM
- duration (integer, required) // minutes
- partySize (integer, required, min: 1, max: 20)
- status (enum: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)
- customerName (string, required)
- customerEmail (email, required)
- customerPhone (string, required)
- specialRequests (string, optional)
- notes (string, optional)
- confirmationCode (string, required)

**Reviews Collection:**

- restaurantId (string, required)
- customerId (string, required)
- bookingId (string, optional)
- rating (integer, required, min: 1, max: 5)
- title (string, optional)
- comment (string, required)
- images (string array, optional)
- isApproved (boolean, default: false)

### 5. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## 📱 Использование приложения

### Первый запуск

1. Перейдите на `/register`
2. Зарегистрируйте первого пользователя - он автоматически получит роль ADMIN
3. Войдите в систему и начните настройку

### Демо данные

Для тестирования можете использовать следующие демо аккаунты:

- **Администратор**: admin@example.com / 098098098
- **Владелец ресторана**: owner@example.com / password123
- **Клиент**: customer@example.com / password123

## 🏗️ Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Группа авторизации
│   ├── (dashboard)/       # Группа дашбордов
│   └── restaurants/       # Публичные страницы ресторанов
├── components/            # React компоненты
│   ├── ui/               # Базовые UI компоненты
│   ├── common/           # Общие компоненты
│   ├── restaurants/      # Компоненты ресторанов
│   └── bookings/         # Компоненты бронирований
├── hooks/                # Кастомные React хуки
├── services/             # API сервисы
├── store/                # Zustand сторы
├── types/                # TypeScript типы
└── constants/            # Константы конфигурации
```

## 🎨 Кастомизация

### Tailwind CSS

Конфигурация Tailwind находится в `tailwind.config.js`. Приложение использует:

- Кастомную цветовую палитру
- Дополнительные анимации
- Расширенные breakpoints

### Темы и стили

Глобальные стили находятся в `src/app/globals.css` и включают:

- CSS переменные для цветов
- Кастомные анимации
- Стили для компонентов DatePicker и Toast

## 🔧 Скрипты разработки

```bash
# Разработка
npm run dev              # Запуск в режиме разработки
npm run build           # Сборка для продакшена
npm run start           # Запуск продакшен сборки
npm run lint            # Проверка кода ESLint

# База данных
npm run db:setup        # Создание коллекций
npm run db:reset        # Удаление коллекций
npm run db:reset-setup  # Пересоздание коллекций
npm run db:test         # Тест подключения к БД
```

## 🚀 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения в настройках проекта
3. Деплой произойдет автоматически

### Другие платформы

Приложение совместимо с любыми платформами, поддерживающими Next.js:

- Netlify
- AWS Amplify
- Railway
- Heroku

## 🔐 Безопасность

- Все API запросы проходят через Appwrite с проверкой прав
- Middleware проверяет авторизацию на защищенных маршрутах
- Валидация данных на клиенте и сервере
- Защита от XSS и CSRF атак

## 🤝 Вклад в проект

1. Сделайте форк проекта
2. Создайте ветку для функции (`git checkout -b feature/AmazingFeature`)
3. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для подробностей.

## 🙏 Благодарности

- [Next.js](https://nextjs.org/) за отличный фреймворк
- [Appwrite](https://appwrite.io/) за Backend-as-a-Service
- [Tailwind CSS](https://tailwindcss.com/) за утилитарные классы
- [Lucide](https://lucide.dev/) за иконки
- Сообществу за фидбек и предложения

---

Сделано с ❤️ для ресторанного бизнеса
