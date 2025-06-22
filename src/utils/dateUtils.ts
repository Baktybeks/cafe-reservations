// src/utils/dateUtils.ts
// Утилиты для последовательного форматирования дат в формате dd.MM.yyyy

export const formatDate = (
  date: string | Date | null,
  options?: {
    includeTime?: boolean;
    includeWeekday?: boolean;
    shortMonth?: boolean;
  }
): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "";

  const {
    includeTime = false,
    includeWeekday = false,
    shortMonth = false,
  } = options || {};

  // Базовый формат dd.MM.yyyy
  let formatted = dateObj.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Убеждаемся что точки используются как разделители
  formatted = formatted.replace(/\//g, ".");

  // Добавляем день недели если нужно
  if (includeWeekday) {
    const weekday = dateObj.toLocaleDateString("ru-RU", {
      weekday: shortMonth ? "short" : "long",
    });
    formatted = `${weekday}, ${formatted}`;
  }

  // Добавляем время если нужно
  if (includeTime) {
    const time = dateObj.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
    formatted = `${formatted} в ${time}`;
  }

  return formatted;
};

export const formatDateShort = (date: string | Date | null): string => {
  return formatDate(date);
};

export const formatDateLong = (date: string | Date | null): string => {
  return formatDate(date, { includeWeekday: true });
};

export const formatDateTime = (date: string | Date | null): string => {
  return formatDate(date, { includeTime: true, includeWeekday: true });
};

export const formatDateForInput = (date: Date | null): string => {
  if (!date) return "";

  // Для input[type="date"] нужен формат YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const parseDateFromInput = (dateString: string): Date | null => {
  if (!dateString) return null;

  // Если формат dd.MM.yyyy
  if (dateString.includes(".")) {
    const [day, month, year] = dateString.split(".");
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isNaN(date.getTime()) ? null : date;
  }

  // Если формат YYYY-MM-DD
  if (dateString.includes("-")) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};

export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;

  return (
    today.getDate() === targetDate.getDate() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getFullYear() === targetDate.getFullYear()
  );
};

export const isTomorrow = (date: string | Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetDate = typeof date === "string" ? new Date(date) : date;

  return (
    tomorrow.getDate() === targetDate.getDate() &&
    tomorrow.getMonth() === targetDate.getMonth() &&
    tomorrow.getFullYear() === targetDate.getFullYear()
  );
};

export const isThisWeek = (date: string | Date): boolean => {
  const today = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return targetDate >= startOfWeek && targetDate <= endOfWeek;
};

export const getRelativeDate = (date: string | Date): string => {
  const targetDate = typeof date === "string" ? new Date(date) : date;

  if (isToday(targetDate)) {
    return "Сегодня";
  }

  if (isTomorrow(targetDate)) {
    return "Завтра";
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    yesterday.getDate() === targetDate.getDate() &&
    yesterday.getMonth() === targetDate.getMonth() &&
    yesterday.getFullYear() === targetDate.getFullYear()
  ) {
    return "Вчера";
  }

  if (isThisWeek(targetDate)) {
    return targetDate.toLocaleDateString("ru-RU", { weekday: "long" });
  }

  return formatDate(targetDate);
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getStartOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const getEndOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Воскресенье или суббота
};

export const getBusinessDaysUntil = (
  startDate: Date,
  endDate: Date
): number => {
  let count = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (!isWeekend(currentDate)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

// Специфичные утилиты для бронирований
export const isValidBookingDate = (
  date: Date,
  minAdvanceHours: number = 2,
  maxAdvanceDays: number = 30
): { isValid: boolean; reason?: string } => {
  const now = new Date();
  const minDate = new Date(now.getTime() + minAdvanceHours * 60 * 60 * 1000);
  const maxDate = addDays(now, maxAdvanceDays);

  if (date < minDate) {
    return {
      isValid: false,
      reason: `Бронирование должно быть минимум за ${minAdvanceHours} часа`,
    };
  }

  if (date > maxDate) {
    return {
      isValid: false,
      reason: `Бронирование доступно максимум на ${maxAdvanceDays} дней вперед`,
    };
  }

  return { isValid: true };
};

export const formatBookingDateTime = (date: string, time: string): string => {
  const dateObj = new Date(date);
  const formattedDate = formatDateLong(dateObj);
  return `${formattedDate} в ${time}`;
};

// Константы для дней недели и месяцев на русском
export const WEEKDAYS_RU = [
  "Воскресенье",
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
];

export const WEEKDAYS_SHORT_RU = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export const MONTHS_RU = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const MONTHS_SHORT_RU = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
];

export default {
  formatDate,
  formatDateShort,
  formatDateLong,
  formatDateTime,
  formatDateForInput,
  parseDateFromInput,
  formatBookingDateTime,
  isToday,
  isTomorrow,
  isThisWeek,
  getRelativeDate,
  addDays,
  addMonths,
  isSameDay,
  isWeekend,
  isValidBookingDate,
};
