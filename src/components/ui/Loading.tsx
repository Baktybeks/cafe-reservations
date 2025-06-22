// src/components/ui/Loading.tsx

"use client";

import React from "react";
import { Loader2, UtensilsCrossed } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "bars" | "brand";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function Loading({
  size = "md",
  variant = "spinner",
  text,
  fullScreen = false,
  className = "",
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <Loader2
            className={`animate-spin text-indigo-600 ${sizeClasses[size]}`}
          />
        );

      case "dots":
        return (
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`bg-indigo-600 rounded-full animate-pulse ${
                  size === "sm"
                    ? "h-2 w-2"
                    : size === "md"
                    ? "h-3 w-3"
                    : size === "lg"
                    ? "h-4 w-4"
                    : "h-6 w-6"
                }`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        );

      case "bars":
        return (
          <div className="flex space-x-1 items-end">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`bg-indigo-600 animate-pulse ${
                  size === "sm"
                    ? "w-1"
                    : size === "md"
                    ? "w-1.5"
                    : size === "lg"
                    ? "w-2"
                    : "w-3"
                }`}
                style={{
                  height: `${
                    (i + 1) *
                    (size === "sm"
                      ? 8
                      : size === "md"
                      ? 12
                      : size === "lg"
                      ? 16
                      : 24)
                  }px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
        );

      case "brand":
        return (
          <div className="flex items-center space-x-3">
            <UtensilsCrossed
              className={`text-indigo-600 animate-pulse ${sizeClasses[size]}`}
            />
            {size !== "sm" && (
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`bg-indigo-600 rounded-full animate-bounce ${
                      size === "md"
                        ? "h-2 w-2"
                        : size === "lg"
                        ? "h-3 w-3"
                        : "h-4 w-4"
                    }`}
                    style={{
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <Loader2
            className={`animate-spin text-indigo-600 ${sizeClasses[size]}`}
          />
        );
    }
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      {renderLoader()}
      {text && (
        <p
          className={`text-gray-600 ${textSizeClasses[size]} text-center max-w-xs`}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-50 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">{content}</div>
      </div>
    );
  }

  return content;
}

// Специализированные компоненты загрузки
export function PageLoading({ text = "Загрузка..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loading variant="brand" size="lg" text={text} />
    </div>
  );
}

export function CardLoading({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded-xl h-48 mb-4"></div>
      <div className="space-y-2">
        <div className="bg-gray-200 h-4 rounded w-3/4"></div>
        <div className="bg-gray-200 h-4 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="border-b border-gray-200 py-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-200 h-4 rounded w-1/4"></div>
            <div className="bg-gray-200 h-4 rounded w-1/3"></div>
            <div className="bg-gray-200 h-4 rounded w-1/6"></div>
            <div className="bg-gray-200 h-4 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ButtonLoading({
  children,
  loading = false,
  ...props
}: {
  children: React.ReactNode;
  loading?: boolean;
  [key: string]: any;
}) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      <div className="flex items-center justify-center">
        {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
        {children}
      </div>
    </button>
  );
}

// Компонент скелетона для карточек ресторанов
export function RestaurantCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-48"></div>
      <div className="p-4">
        <div className="bg-gray-200 h-6 rounded mb-2"></div>
        <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
        <div className="flex items-center space-x-2 mb-3">
          <div className="bg-gray-200 h-4 w-16 rounded"></div>
          <div className="bg-gray-200 h-4 w-12 rounded"></div>
        </div>
        <div className="bg-gray-200 h-4 rounded w-2/3 mb-4"></div>
        <div className="bg-gray-200 h-8 rounded"></div>
      </div>
    </div>
  );
}

// Компонент скелетона для карточек бронирований
export function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="bg-gray-200 h-5 w-32 rounded"></div>
          <div className="bg-gray-200 h-4 w-24 rounded"></div>
        </div>
        <div className="bg-gray-200 h-6 w-16 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="bg-gray-200 h-4 w-20 rounded"></div>
          <div className="bg-gray-200 h-4 w-16 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="bg-gray-200 h-4 w-24 rounded"></div>
          <div className="bg-gray-200 h-4 w-20 rounded"></div>
        </div>
      </div>

      <div className="bg-gray-200 h-8 w-24 rounded"></div>
    </div>
  );
}

export default Loading;
