// src/components/common/SimpleNotificationProvider.tsx
// Альтернатива react-toastify без внешних зависимостей

"use client";

import React, { useEffect } from "react";
import { useNotificationStore } from "@/store/appStore";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  message,
  type,
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "border-l-green-500";
      case "error":
        return "border-l-red-500";
      case "warning":
        return "border-l-amber-500";
      case "info":
        return "border-l-blue-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <div
      className={`
        relative flex items-start p-4 mb-3 bg-white border-l-4 rounded-lg shadow-lg
        transform transition-all duration-300 ease-in-out animate-slide-in
        ${getBorderColor()}
      `}
    >
      <div className="flex-shrink-0 mr-3">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 text-sm">{title}</div>
        <div className="text-gray-600 text-sm mt-1">{message}</div>
      </div>

      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const SimpleNotificationProvider: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  // Автоматическое удаление уведомлений
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.duration !== 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full">
      <div className="space-y-2">
        {notifications.slice(0, 5).map((notification) => (
          <NotificationItem
            key={notification.id}
            id={notification.id}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

// Хук для простого использования уведомлений
export const useSimpleNotifications = () => {
  const { addNotification } = useNotificationStore();

  const showSuccess = (title: string, message: string, duration?: number) => {
    addNotification({
      type: "success",
      title,
      message,
      duration,
    });
  };

  const showError = (title: string, message: string, duration?: number) => {
    addNotification({
      type: "error",
      title,
      message,
      duration,
    });
  };

  const showWarning = (title: string, message: string, duration?: number) => {
    addNotification({
      type: "warning",
      title,
      message,
      duration,
    });
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    addNotification({
      type: "info",
      title,
      message,
      duration,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export default SimpleNotificationProvider;
