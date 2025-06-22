// src/components/ui/Badge.tsx

"use client";

import React, { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "secondary";
  size?: "sm" | "md" | "lg";
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
  dot = false,
}: BadgeProps) {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    error: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    secondary: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  const dotColors = {
    default: "bg-gray-400",
    success: "bg-green-400",
    warning: "bg-yellow-400",
    error: "bg-red-400",
    info: "bg-blue-400",
    secondary: "bg-purple-400",
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `
        .replace(/\s+/g, " ")
        .trim()}
    >
      {dot && (
        <span className={`mr-1.5 h-2 w-2 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}
