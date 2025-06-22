// src/components/common/NotificationProvider.tsx

"use client";

import React, { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNotificationStore } from "@/store/appStore";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

interface CustomToastProps {
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({
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
      className={`flex items-start p-4 bg-white border-l-4 rounded-lg shadow-lg ${getBorderColor()}`}
    >
      <div className="flex-shrink-0 mr-3">{getIcon()}</div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 text-sm">{title}</div>
        <div className="text-gray-600 text-sm mt-1">{message}</div>
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 ml-3 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const NotificationProvider: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  useEffect(() => {
    notifications.forEach((notification) => {
      const toastId = `toast-${notification.id}`;

      // Проверяем, не показан ли уже этот toast
      if (!toast.isActive(toastId)) {
        const handleClose = () => {
          removeNotification(notification.id);
          toast.dismiss(toastId);
        };

        toast(
          <CustomToast
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={handleClose}
          />,
          {
            toastId,
            type: notification.type,
            autoClose: notification.duration || 5000,
            closeButton: false,
            hideProgressBar: true,
            style: {
              padding: 0,
              background: "transparent",
              boxShadow: "none",
            },
            onClose: () => removeNotification(notification.id),
          }
        );
      }
    });
  }, [notifications, removeNotification]);

  return (
    <ToastContainer
      position="top-right"
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      limit={5}
      style={{
        top: "1rem",
        right: "1rem",
      }}
    />
  );
};

// Хук для простого использования уведомлений
export const useNotifications = () => {
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

export default NotificationProvider;
