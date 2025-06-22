// src/utils/index.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Объединение классов Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Форматирование даты
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("ru-RU", defaultOptions).format(
    typeof date === "string" ? new Date(date) : date
  );
};

// Форматирование времени
export const formatTime = (time: string) => {
  return time;
};

// Форматирование даты и времени для отображения
export const formatDateTime = (date: string | Date, time?: string) => {
  const formattedDate = formatDate(date, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (time) {
    return `${formattedDate} в ${time}`;
  }

  return formattedDate;
};

// Получение относительного времени (например, "2 часа назад")
export const getRelativeTime = (date: string | Date) => {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const diffInMs = now.getTime() - targetDate.getTime();

  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "только что";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} мин. назад`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ч. назад`;
  } else if (diffInDays < 30) {
    return `${diffInDays} дн. назад`;
  } else {
    return formatDate(targetDate);
  }
};

// Проверка, является ли дата сегодняшней
export const isToday = (date: string | Date) => {
  const today = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;

  return (
    today.getDate() === targetDate.getDate() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getFullYear() === targetDate.getFullYear()
  );
};

// Проверка, является ли дата завтрашней
export const isTomorrow = (date: string | Date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetDate = typeof date === "string" ? new Date(date) : date;

  return (
    tomorrow.getDate() === targetDate.getDate() &&
    tomorrow.getMonth() === targetDate.getMonth() &&
    tomorrow.getFullYear() === targetDate.getFullYear()
  );
};

// Генерация случайного ID
export const generateId = (length: number = 8) => {
  return Math.random().toString(36).substr(2, length);
};

// Генерация кода подтверждения
export const generateConfirmationCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Валидация email
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация телефона
export const isValidPhone = (phone: string) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phone.length >= 10 && phoneRegex.test(phone);
};

// Форматирование телефона
export const formatPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11 && cleaned.startsWith("7")) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7,
      9
    )}-${cleaned.slice(9)}`;
  }

  if (cleaned.length === 10) {
    return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
      8
    )}-${cleaned.slice(8)}`;
  }

  return phone;
};

// Обрезка текста
export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Капитализация первой буквы
export const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

// Получение инициалов из имени
export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Расчет времени окончания бронирования
export const calculateEndTime = (startTime: string, duration: number) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;

  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;

  return `${endHours.toString().padStart(2, "0")}:${endMins
    .toString()
    .padStart(2, "0")}`;
};

// Проверка пересечения временных интервалов
export const hasTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
) => {
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
};

// Генерация временных слотов
export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  interval: number = 30
) => {
  const slots: string[] = [];
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);

  const current = new Date(start);

  while (current < end) {
    const timeString = current.toTimeString().slice(0, 5);
    slots.push(timeString);
    current.setMinutes(current.getMinutes() + interval);
  }

  return slots;
};

// Конвертация цены в читаемый формат
export const formatPrice = (price: number, currency: string = "₽") => {
  return new Intl.NumberFormat("ru-RU").format(price) + " " + currency;
};

// Получение цвета статуса
export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    SUSPENDED: "bg-gray-100 text-gray-800",
  };

  return colors[status] || "bg-gray-100 text-gray-800";
};

// Задержка (для демонстрации)
export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Дебаунс функция
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle функция
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Группировка массива по ключу
export const groupBy = <T>(array: T[], key: keyof T) => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Удаление дубликатов из массива
export const unique = <T>(array: T[], key?: keyof T) => {
  if (key) {
    const seen = new Set();
    return array.filter((item) => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  return [...new Set(array)];
};

// Сортировка массива объектов
export const sortBy = <T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
) => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

// Проверка, является ли объект пустым
export const isEmpty = (obj: object) => {
  return Object.keys(obj).length === 0;
};

// Глубокое клонирование объекта
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Копирование в буфер обмена
export const copyToClipboard = async (text: string) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      return false;
    }
  } else {
    // Fallback для старых браузеров
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      document.body.removeChild(textArea);
      console.error("Failed to copy to clipboard:", err);
      return false;
    }
  }
};

// Скачивание файла
export const downloadFile = (
  data: string,
  filename: string,
  type: string = "text/plain"
) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Проверка поддержки веб-функций
export const browserSupports = {
  clipboard: () => !!navigator.clipboard,
  webShare: () => !!navigator.share,
  serviceWorker: () => "serviceWorker" in navigator,
  notifications: () => "Notification" in window,
  geolocation: () => "geolocation" in navigator,
};

// Получение информации о браузере
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;

  const isChrome = /Chrome/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !isChrome;
  const isEdge = /Edg/.test(userAgent);
  const isMobile = /Mobi|Android/i.test(userAgent);

  return {
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isMobile,
    userAgent,
  };
};

// Проверка онлайн статуса
export const isOnline = () => navigator.onLine;

// Локальное хранилище с проверкой ошибок
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  },

  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} to localStorage:`, error);
      return false;
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  },
};

export default {
  cn,
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  isToday,
  isTomorrow,
  generateId,
  generateConfirmationCode,
  isValidEmail,
  isValidPhone,
  formatPhone,
  truncateText,
  capitalize,
  getInitials,
  calculateEndTime,
  hasTimeOverlap,
  generateTimeSlots,
  formatPrice,
  getStatusColor,
  delay,
  debounce,
  throttle,
  groupBy,
  unique,
  sortBy,
  isEmpty,
  deepClone,
  copyToClipboard,
  downloadFile,
  browserSupports,
  getBrowserInfo,
  isOnline,
  storage,
};
