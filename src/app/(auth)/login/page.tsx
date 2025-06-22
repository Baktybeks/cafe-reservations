// src/app/(auth)/login/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/common/Layout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { UtensilsCrossed, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting || isLoading) return;

    setIsSubmitting(true);
    clearError();

    try {
      await login(formData.email, formData.password);
      // Перенаправление произойдет в useEffect выше
    } catch (error) {
      console.error("Ошибка входа:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  if (user && !isLoading) {
    return null; // Avoid flash before redirect
  }

  return (
    <Layout showNavbar={false}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать
            </h1>
            <p className="text-gray-600">
              Войдите в систему бронирования ресторанов
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Email field */}
              <Input
                label="Email адрес"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                icon={Mail}
                required
                disabled={isSubmitting || isLoading}
              />

              {/* Password field */}
              <div>
                <Input
                  label="Пароль"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Введите пароль"
                  icon={Lock}
                  required
                  disabled={isSubmitting || isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                  style={{ transform: "translateY(-50%)" }}
                >
                  {showPassword ? (
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
                disabled={!formData.email || !formData.password}
              >
                Войти
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Нет аккаунта?{" "}
                <Link
                  href="/register"
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                >
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </div>

          {/* Demo accounts info */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
              Демо аккаунты для тестирования:
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="font-medium">Владелец ресторана</span>
                <span className="text-gray-600">owner@example.com</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="font-medium">Клиент</span>
                <span className="text-gray-600">customer@example.com</span>
              </div>
              <p className="text-center text-gray-500 mt-2">
                Пароль для всех: <span className="font-mono">password123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
