// src/components/ui/Button.tsx

"use client";

import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface ButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  type?: "button" | "submit" | "reset";
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
  fullWidth = false,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow-md",
    secondary:
      "text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500",
    outline:
      "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 shadow-sm",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-indigo-500",
    danger:
      "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md",
    success:
      "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm min-h-[32px]",
    md: "px-4 py-2 text-sm min-h-[40px]",
    lg: "px-6 py-3 text-base min-h-[48px]",
  };

  const isDisabled = disabled || loading;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `
        .replace(/\s+/g, " ")
        .trim()}
    >
      {loading && (
        <svg
          className={`animate-spin h-4 w-4 ${
            iconPosition === "left" ? "mr-2" : "ml-2"
          }`}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {Icon && !loading && iconPosition === "left" && (
        <Icon className="h-4 w-4 mr-2" />
      )}

      <span className="truncate">{children}</span>

      {Icon && !loading && iconPosition === "right" && (
        <Icon className="h-4 w-4 ml-2" />
      )}
    </button>
  );
}
