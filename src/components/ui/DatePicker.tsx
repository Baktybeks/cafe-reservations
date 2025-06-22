// src/components/ui/DatePicker.tsx

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  selected,
  onChange,
  minDate,
  maxDate,
  placeholder = "Выберите дату",
  disabled = false,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    selected
      ? new Date(selected.getFullYear(), selected.getMonth(), 1)
      : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    // Формат dd.MM.yyyy для локализации
    return date
      .toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "."); // Заменяем слеши на точки если нужно
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
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

  const monthNames = [
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

  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input */}
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
        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
        <span
          className={`flex-1 ${selected ? "text-gray-900" : "text-gray-500"}`}
        >
          {selected ? formatDate(selected) : placeholder}
        </span>
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
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
              onClick={() => {
                onChange(new Date());
                setIsOpen(false);
              }}
            >
              Сегодня
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(null);
                setIsOpen(false);
              }}
            >
              Очистить
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
