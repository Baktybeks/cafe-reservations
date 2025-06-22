// src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/appStore";
import { appwriteService } from "@/services/appwriteService";
import { User, UserRole } from "@/types";

export function useAuth() {
  const router = useRouter();
  const { user, isLoading, setUser, setLoading, clearAuth, updateUser } =
    useAuthStore();
  const { addNotification } = useNotificationStore();

  const [error, setError] = useState<string | null>(null);

  // Проверка текущей сессии при загрузке
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        setLoading(true);
        const currentUser = await appwriteService.getCurrentUser();

        if (currentUser) {
          const userDoc = await appwriteService.getUserById(currentUser.$id);
          if (userDoc && userDoc.isActive) {
            setUser(userDoc);
          } else {
            await appwriteService.logout();
            clearAuth();
          }
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error("Ошибка при проверке пользователя:", error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, [setUser, setLoading, clearAuth]);

  // Функция входа
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);
        setError(null);

        const session = await appwriteService.createSession(email, password);
        if (!session) {
          throw new Error("Неверный email или пароль");
        }

        const authUser = await appwriteService.getCurrentUser();
        if (!authUser) {
          throw new Error("Не удалось получить данные пользователя");
        }

        const userDoc = await appwriteService.getUserById(authUser.$id);
        if (!userDoc) {
          await appwriteService.logout();
          throw new Error("Профиль пользователя не найден");
        }

        if (!userDoc.isActive) {
          await appwriteService.logout();
          throw new Error("Аккаунт не активирован администратором");
        }

        setUser(userDoc);

        addNotification({
          type: "success",
          title: "Успешный вход",
          message: `Добро пожаловать, ${userDoc.name}!`,
        });

        return userDoc;
      } catch (error: any) {
        const message = error?.message || "Ошибка при входе";
        setError(message);
        addNotification({
          type: "error",
          title: "Ошибка входа",
          message,
        });
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, addNotification]
  );

  // Функция регистрации
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: UserRole,
      phone?: string
    ) => {
      try {
        setLoading(true);
        setError(null);

        const authUser = await appwriteService.createAccount(
          name,
          email,
          password
        );
        if (!authUser) {
          throw new Error("Не удалось создать аккаунт");
        }

        // Проверяем, первый ли это пользователь (автоматически делаем админом)
        const allUsers = await appwriteService.getUsers();
        const isFirstUser = allUsers.length === 0;
        const finalRole = isFirstUser ? UserRole.ADMIN : role;

        const userData: Omit<User, "$id" | "$updatedAt"> = {
          name,
          email,
          phone,
          role: finalRole,
          isActive: isFirstUser, // Первый пользователь автоматически активен
          $createdAt: new Date().toISOString(),
        };

        const userDoc = await appwriteService.createUserDocument(
          authUser.$id,
          userData
        );

        if (isFirstUser) {
          // Если первый пользователь, сразу входим
          setUser(userDoc);
          addNotification({
            type: "success",
            title: "Добро пожаловать!",
            message: "Ваш аккаунт администратора создан и активирован",
          });
        } else {
          // Иначе выходим из системы до активации
          await appwriteService.logout();
          addNotification({
            type: "info",
            title: "Регистрация завершена",
            message: "Ваш аккаунт ожидает активации администратором",
          });
        }

        return { userDoc, isFirstUser };
      } catch (error: any) {
        const message = error?.message || "Ошибка при регистрации";
        setError(message);
        addNotification({
          type: "error",
          title: "Ошибка регистрации",
          message,
        });
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, addNotification]
  );

  // Функция выхода
  const logout = useCallback(async () => {
    try {
      await appwriteService.logout();
      clearAuth();

      addNotification({
        type: "success",
        title: "Выход выполнен",
        message: "Вы успешно вышли из системы",
      });

      router.push("/login");
    } catch (error: any) {
      console.error("Ошибка при выходе:", error);
      clearAuth();
    }
  }, [clearAuth, addNotification, router]);

  // Функция обновления профиля
  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!user) {
        throw new Error("Пользователь не авторизован");
      }

      try {
        setLoading(true);

        const updatedUser = await appwriteService.updateUserDocument(
          user.$id,
          updates
        );
        if (updatedUser) {
          updateUser(updatedUser);

          addNotification({
            type: "success",
            title: "Профиль обновлен",
            message: "Ваш профиль успешно обновлен",
          });

          return updatedUser;
        } else {
          throw new Error("Не удалось обновить профиль");
        }
      } catch (error: any) {
        const message = error?.message || "Ошибка при обновлении профиля";
        setError(message);
        addNotification({
          type: "error",
          title: "Ошибка обновления",
          message,
        });
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [user, updateUser, setLoading, addNotification]
  );

  // Очистка ошибок
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Проверка ролей
  const hasRole = useCallback(
    (roles: UserRole | UserRole[]): boolean => {
      if (!user) return false;

      if (Array.isArray(roles)) {
        return roles.includes(user.role);
      }

      return user.role === roles;
    },
    [user]
  );

  // Проверка доступа к маршруту
  const canAccessRoute = useCallback(
    (route: string): boolean => {
      if (!user) return false;

      // Публичные маршруты
      if (route.startsWith("/restaurants") || route === "/") {
        return true;
      }

      // Маршруты для клиентов
      if (route.startsWith("/customer")) {
        return hasRole([UserRole.CUSTOMER, UserRole.ADMIN]);
      }

      // Маршруты для владельцев ресторанов
      if (route.startsWith("/restaurant-owner")) {
        return hasRole([UserRole.RESTAURANT_OWNER, UserRole.ADMIN]);
      }

      // Маршруты для администраторов
      if (route.startsWith("/admin")) {
        return hasRole(UserRole.ADMIN);
      }

      return true;
    },
    [user, hasRole]
  );

  // Получение домашнего маршрута в зависимости от роли
  const getHomeRoute = useCallback((): string => {
    if (!user) return "/login";

    switch (user.role) {
      case UserRole.ADMIN:
        return "/admin";
      case UserRole.RESTAURANT_OWNER:
        return "/restaurant-owner";
      case UserRole.CUSTOMER:
        return "/customer";
      default:
        return "/";
    }
  }, [user]);

  return {
    // Состояние
    user,
    isLoading,
    error,
    isAuthenticated: !!user,

    // Функции
    login,
    register,
    logout,
    updateProfile,
    clearError,

    // Утилиты
    hasRole,
    canAccessRoute,
    getHomeRoute,
  };
}
