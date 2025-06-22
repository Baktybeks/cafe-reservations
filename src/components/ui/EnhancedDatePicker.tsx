// src/components/ui/EnhancedDatePicker.tsx
// Полнофункциональная альтернатива react-datepicker с поддержкой формата dd.MM.yyyy

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";

interface EnhancedDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dateFormat?: "dd.MM.yyyy" | "dd/MM/yyyy";
  allowManualInput?: boolean;
  showClearButton?: boolean;
  locale?: "ru" | "en";
}

export function EnhancedDatePicker({
  selected,
  onChange,
  minDate,
  maxDate,
  placeholder = "Выберите дату",
  disabled = false,
  className = "",
  dateFormat = "dd.MM.yyyy",
  allowManualInput = true,
  showClearButton = true,
  locale = "ru",
}: EnhancedDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [currentMonth, setCurrentMonth] = useState(
    selected
      ? new Date(selected.getFullYear(), selected.getMonth(), 1)
      : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Обновляем inputValue при изменении selected
  useEffect(() => {
    if (selected) {
      setInputValue(formatDateForDisplay(selected));
    } else {
      setInputValue("");
    }
  }, [selected, dateFormat]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        validateAndSetDate(inputValue);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue]);

  const formatDateForDisplay = (date: Date) => {
    const separator = dateFormat.includes(".") ? "." : "/";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}${separator}${month}${separator}${year}`;
  };

  const parseDateFromInput = (value: string): Date | null => {
    if (!value.trim()) return null;

    // Определяем разделитель
    const separator = value.includes(".")
      ? "."
      : value.includes("/")
      ? "/"
      : null;
    if (!separator) return null;

    const parts = value.split(separator);
    if (parts.length !== 3) return null;

    const [dayStr, monthStr, yearStr] = parts;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10) - 1; // Month is 0-indexed
    const year = parseInt(yearStr, 10);

    // Базовая валидация
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (day < 1 || day > 31) return null;
    if (month < 0 || month > 11) return null;
    if (year < 1900 || year > 2100) return null;

    const date = new Date(year, month, day);

    // Проверяем что дата валидна (например, 31 февраля станет 3 марта)
    if (
      date.getDate() !== day ||
      date.getMonth() !== month ||
      date.getFullYear() !== year
    ) {
      return null;
    }

    return date;
  };

  const validateAndSetDate = (value: string) => {
    const date = parseDateFromInput(value);

    if (date) {
      if (isDateDisabled(date)) {
        // Дата заблокирована, возвращаем к предыдущему значению
        setInputValue(selected ? formatDateForDisplay(selected) : "");
        return;
      }
      onChange(date);
    } else if (value.trim() === "") {
      onChange(null);
    } else {
      // Неверный формат, возвращаем к предыдущему значению
      setInputValue(selected ? formatDateForDisplay(selected) : "");
    }
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      validateAndSetDate(inputValue);
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setInputValue(selected ? formatDateForDisplay(selected) : "");
      setIsOpen(false);
    }
  };

  const handleInputBlur = () => {
    validateAndSetDate(inputValue);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Добавляем пустые ячейки для предыдущего месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateClick = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleClear = () => {
    onChange(null);
    setInputValue("");
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    if (!isDateDisabled(today)) {
      onChange(today);
      setIsOpen(false);
    }
  };

  const monthNames =
    locale === "ru"
      ? [
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
        ]
      : [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

  const dayNames =
    locale === "ru"
      ? ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
      : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input */}
      <div className="relative">
        {allowManualInput ? (
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-20"
          />
        ) : (
          <div
            className={`
              flex items-center w-full px-3 py-2 border border-gray-300 rounded-lg
              bg-white cursor-pointer transition-colors
              ${isOpen ? "border-indigo-500 ring-1 ring-indigo-500" : ""}
              ${
                disabled
                  ? "bg-gray-100 cursor-not-allowed"
                  : "hover:border-gray-400"
              }
            `}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            <span
              className={`flex-1 ${
                selected ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {selected ? formatDateForDisplay(selected) : placeholder}
            </span>
          </div>
        )}

        {/* Icons */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {showClearButton && selected && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 mr-2 p-1 rounded"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded"
            disabled={disabled}
          >
            <Calendar className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 animate-slide-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("prev")}
              icon={ChevronLeft}
            >
              {""}
            </Button>

            <h3 className="text-lg font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              icon={ChevronRight}
            >
              {""}
            </Button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-10" />;
              }

              const isSelected =
                selected &&
                day.getDate() === selected.getDate() &&
                day.getMonth() === selected.getMonth() &&
                day.getFullYear() === selected.getFullYear();

              const isDisabled = isDateDisabled(day);
              const isToday =
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !isDisabled && handleDateClick(day)}
                  disabled={isDisabled}
                  className={`
                    h-10 w-10 rounded-lg text-sm font-medium transition-colors
                    ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : isToday
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-gray-900 hover:bg-gray-100"
                    }
                    ${
                      isDisabled
                        ? "text-gray-300 cursor-not-allowed hover:bg-transparent"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToday}
              disabled={isDateDisabled(new Date())}
            >
              {locale === "ru" ? "Сегодня" : "Today"}
            </Button>

            {showClearButton && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                {locale === "ru" ? "Очистить" : "Clear"}
              </Button>
            )}
          </div>

          {/* Format hint */}
          {allowManualInput && (
            <div className="text-xs text-gray-500 mt-2 text-center">
              Формат: {dateFormat}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
