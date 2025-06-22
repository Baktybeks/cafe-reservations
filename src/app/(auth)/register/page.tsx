// src/app/(auth)/register/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/common/Layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import {
  UtensilsCrossed,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  UserCheck,
} from "lucide-react";
import { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: UserRole.CUSTOMER,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Перенаправляем авторизованных пользователей
  useEffect(() => {
    if (user && !isLoading) {
      const redirectPath =
        user.role === "ADMIN"
          ? "/admin"
          : user.role === "RESTAURANT_OWNER"
          ? "/restaurant-owner"
          : "/customer";
      router.push(redirectPath);
    }
  }, [user, isLoading, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Имя обязательно";
    } else if (formData.name.length < 2) {
      newErrors.name = "Имя должно содержать минимум 2 символа";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Некорректный формат email";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Некорректный формат телефона";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isLoading) return;

    if (!validateForm()) return;

    setIsSubmitting(true);
    clearError();

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.phone || undefined
      );

      if (result?.isFirstUser) {
        // Первый пользователь (администратор) - автоматически авторизован
        setRegistrationSuccess(true);
      } else {
        // Обычный пользователь - показываем сообщение об ожидании активации
        setRegistrationSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error) {
      console.error("Ошибка регистрации:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Очищаем ошибки при изменении
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (error) clearError();
  };

  if (user && !isLoading) {
    return null; // Avoid flash before redirect
  }

  if (registrationSuccess) {
    return (
      <Layout showNavbar={false}>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Регистрация успешна!
              </h1>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Ваш аккаунт создан и ожидает активации администратором. После
                  активации вы сможете войти в систему.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>
                      <strong>Имя:</strong> {formData.name}
                    </div>
                    <div>
                      <strong>Email:</strong> {formData.email}
                    </div>
                    <div>
                      <strong>Роль:</strong>{" "}
                      {formData.role === UserRole.CUSTOMER
                        ? "Клиент"
                        : formData.role === UserRole.RESTAURANT_OWNER
                        ? "Владелец ресторана"
                        : "Администратор"}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Перенаправление на страницу входа...
                </p>
              </div>
              <div className="mt-6">
                <Button onClick={() => router.push("/login")}>
                  Перейти ко входу
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNavbar={false}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Создать аккаунт
            </h1>
            <p className="text-gray-600">
              Присоединяйтесь к системе бронирования ресторанов
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Name field */}
              <Input
                label="Полное имя"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Иван Иванов"
                icon={User}
                required
                disabled={isSubmitting || isLoading}
                error={errors.name}
              />

              {/* Email field */}
              <Input
                label="Email адрес"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ivan@example.com"
                icon={Mail}
                required
                disabled={isSubmitting || isLoading}
                error={errors.email}
              />

              {/* Phone field */}
              <Input
                label="Телефон"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+7 (999) 123-45-67"
                icon={Phone}
                disabled={isSubmitting || isLoading}
                error={errors.phone}
                helpText="Опционально"
              />

              {/* Role selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Роль в системе
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  disabled={isSubmitting || isLoading}
                  required
                >
                  <option value={UserRole.CUSTOMER}>
                    Клиент - бронирование столиков
                  </option>
                  <option value={UserRole.RESTAURANT_OWNER}>
                    Владелец ресторана - управление рестораном
                  </option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Выберите роль в зависимости от того, как планируете
                  использовать систему
                </p>
              </div>

              {/* Password field */}
              <div className="relative">
                <Input
                  label="Пароль"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Минимум 8 символов"
                  icon={Lock}
                  required
                  disabled={isSubmitting || isLoading}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Confirm password field */}
              <div className="relative">
                <Input
                  label="Подтверждение пароля"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Повторите пароль"
                  icon={Lock}
                  required
                  disabled={isSubmitting || isLoading}
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isSubmitting || isLoading}
                disabled={
                  !formData.name ||
                  !formData.email ||
                  !formData.password ||
                  !formData.confirmPassword
                }
                icon={UserCheck}
              >
                Зарегистрироваться
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Уже есть аккаунт?{" "}
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Войти
                </Link>
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
              О системе бронирования:
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                <span>
                  <strong>Клиенты</strong> могут искать рестораны и бронировать
                  столики
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>
                  <strong>Владельцы</strong> управляют своими ресторанами и
                  бронированиями
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                <span>
                  <strong>Администраторы</strong> модерируют рестораны и
                  пользователей
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
