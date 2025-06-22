// src/hooks/useSyncAuthCookie.ts

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function useSyncAuthCookie() {
  const { user } = useAuthStore();

  useEffect(() => {
    const updateAuthCookie = () => {
      try {
        if (user && user.$id) {
          // ИСПРАВЛЕНО: Создаем структуру, совместимую с middleware
          const authData = {
            state: {
              user: {
                $id: user.$id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                name: user.name,
                phone: user.phone,
                $createdAt: user.$createdAt,
                $updatedAt: user.$updatedAt,
                avatar: user.avatar,
                preferences: user.preferences,
              },
            },
          };

          // ИСПРАВЛЕНО: Устанавливаем cookie с более длительным сроком действия
          document.cookie = `auth-storage=${encodeURIComponent(
            JSON.stringify(authData)
          )}; path=/; max-age=2592000; SameSite=Lax; Secure=${
            window.location.protocol === "https:"
          }`;

          console.log("🍪 Auth cookie обновлен:", user.email);
        } else {
          // ИСПРАВЛЕНО: Очищаем cookie при отсутствии пользователя
          document.cookie = `auth-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
          console.log("🍪 Auth cookie очищен");
        }
      } catch (error) {
        console.error("Ошибка при обновлении auth cookie:", error);
      }
    };

    updateAuthCookie();
  }, [user]);

  // ИСПРАВЛЕНО: Добавляем обработчик события beforeunload для сохранения состояния
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && user.$id) {
        try {
          const authData = {
            state: {
              user: user,
            },
          };
          localStorage.setItem("auth-storage", JSON.stringify(authData));
        } catch (error) {
          console.error("Ошибка при сохранении auth state:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);
}
