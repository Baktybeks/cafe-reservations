// src/app/(dashboard)/profile/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useUserBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/bookings/BookingCard";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  UtensilsCrossed,
  Clock,
  Heart,
  Settings,
  LogOut,
} from "lucide-react";
import { UserRole, BookingStatus } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const { data: userBookings = [], isLoading: bookingsLoading } =
    useUserBookings(user?.$id || "");

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              Войдите в систему для доступа к профилю
            </p>
            <Button onClick={() => router.push("/login")}>Войти</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      phone: user.phone || "",
    });
    setIsEditing(false);
  };

  const getRoleLabel = (role: UserRole): string => {
    const labels = {
      [UserRole.ADMIN]: "Администратор",
      [UserRole.RESTAURANT_OWNER]: "Владелец ресторана",
      [UserRole.CUSTOMER]: "Клиент",
    };
    return labels[role];
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "error";
      case UserRole.RESTAURANT_OWNER:
        return "warning";
      case UserRole.CUSTOMER:
        return "info";
      default:
        return "default";
    }
  };

  // Статистика бронирований
  const bookingStats = {
    total: userBookings.length,
    pending: userBookings.filter((b) => b.status === BookingStatus.PENDING)
      .length,
    confirmed: userBookings.filter((b) => b.status === BookingStatus.CONFIRMED)
      .length,
    completed: userBookings.filter((b) => b.status === BookingStatus.COMPLETED)
      .length,
    cancelled: userBookings.filter((b) => b.status === BookingStatus.CANCELLED)
      .length,
  };

  const recentBookings = userBookings.slice(0, 3);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <User className="h-6 w-6 mr-3 text-indigo-600" />
                  Мой профиль
                </h1>
                <p className="text-gray-600 mt-1">
                  Управляйте своей учетной записью и настройками
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  icon={Settings}
                  onClick={() => router.push("/settings")}
                >
                  Настройки
                </Button>
                <Button variant="outline" icon={LogOut} onClick={logout}>
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Основная информация</CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        icon={Edit}
                      >
                        Редактировать
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          icon={X}
                        >
                          Отмена
                        </Button>
                        <Button size="sm" onClick={handleSave} icon={Save}>
                          Сохранить
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <Input
                        label="Имя"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        icon={User}
                      />
                      <Input
                        label="Телефон"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        icon={Phone}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">Имя</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500">Email</div>
                        </div>
                      </div>

                      {user.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.phone}
                            </div>
                            <div className="text-sm text-gray-500">Телефон</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {getRoleLabel(user.role)}
                            </span>
                            <Badge
                              variant={getRoleBadgeVariant(user.role)}
                              size="sm"
                            >
                              {user.role}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            Роль в системе
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {new Date(user.$createdAt).toLocaleDateString(
                              "ru-RU"
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Дата регистрации
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              {user.role === UserRole.CUSTOMER && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Последние бронирования
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookingsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="bg-gray-200 h-20 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : recentBookings.length > 0 ? (
                      <div className="space-y-4">
                        {recentBookings.map((booking) => (
                          <BookingCard
                            key={booking.$id}
                            booking={booking}
                            variant="customer"
                          />
                        ))}
                        {userBookings.length > 3 && (
                          <Button
                            variant="outline"
                            fullWidth
                            onClick={() => router.push("/customer/bookings")}
                          >
                            Показать все бронирования ({userBookings.length})
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Нет бронирований
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Вы еще не делали бронирований
                        </p>
                        <Button
                          onClick={() => router.push("/restaurants")}
                          icon={UtensilsCrossed}
                        >
                          Найти ресторан
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Статус аккаунта</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Статус</span>
                      <Badge variant={user.isActive ? "success" : "warning"}>
                        {user.isActive ? "Активен" : "Неактивен"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Роль</span>
                      <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Верификация</span>
                      <Badge variant="success" size="sm">
                        Email подтвержден
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Statistics */}
              {user.role === UserRole.CUSTOMER && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Статистика бронирований
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Всего</span>
                        <span className="font-medium">
                          {bookingStats.total}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Ожидают подтверждения
                        </span>
                        <Badge variant="warning" size="sm">
                          {bookingStats.pending}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Подтверждено
                        </span>
                        <Badge variant="info" size="sm">
                          {bookingStats.confirmed}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Завершено</span>
                        <Badge variant="success" size="sm">
                          {bookingStats.completed}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Отменено</span>
                        <Badge variant="error" size="sm">
                          {bookingStats.cancelled}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Быстрые действия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {user.role === UserRole.CUSTOMER && (
                    <>
                      <Button
                        variant="outline"
                        fullWidth
                        icon={UtensilsCrossed}
                        onClick={() => router.push("/restaurants")}
                      >
                        Найти ресторан
                      </Button>

                      <Button
                        variant="outline"
                        fullWidth
                        icon={Heart}
                        onClick={() => router.push("/customer/favorites")}
                      >
                        Избранное
                      </Button>

                      <Button
                        variant="outline"
                        fullWidth
                        icon={Calendar}
                        onClick={() => router.push("/customer/bookings")}
                      >
                        Мои бронирования
                      </Button>
                    </>
                  )}

                  {user.role === UserRole.RESTAURANT_OWNER && (
                    <>
                      <Button
                        variant="outline"
                        fullWidth
                        icon={UtensilsCrossed}
                        onClick={() => router.push("/restaurant-owner")}
                      >
                        Мои рестораны
                      </Button>

                      <Button
                        variant="outline"
                        fullWidth
                        icon={Calendar}
                        onClick={() =>
                          router.push("/restaurant-owner/bookings")
                        }
                      >
                        Бронирования
                      </Button>
                    </>
                  )}

                  {user.role === UserRole.ADMIN && (
                    <>
                      <Button
                        variant="outline"
                        fullWidth
                        icon={Shield}
                        onClick={() => router.push("/admin")}
                      >
                        Панель админа
                      </Button>

                      <Button
                        variant="outline"
                        fullWidth
                        icon={UtensilsCrossed}
                        onClick={() => router.push("/admin/restaurants")}
                      >
                        Модерация
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    fullWidth
                    icon={Settings}
                    onClick={() => router.push("/settings")}
                  >
                    Настройки
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
