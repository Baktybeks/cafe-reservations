// src/app/admin/restaurants/page.tsx

"use client";

import React, { useState } from "react";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { useAuth } from "@/hooks/useAuth";
import {
  useAllRestaurants,
  useModerateRestaurant,
} from "@/hooks/useRestaurants";
import {
  Shield,
  UtensilsCrossed,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Restaurant, RestaurantStatus, UserRole } from "@/types";
import { useRouter } from "next/navigation";

// Локальная функция для лейблов статусов
const getRestaurantStatusLabel = (status: RestaurantStatus): string => {
  console.log(status, "statusstatusstatus");

  const labels = {
    [RestaurantStatus.PENDING]: "На модерации",
    [RestaurantStatus.APPROVED]: "Одобрен",
    [RestaurantStatus.REJECTED]: "Отклонен",
    [RestaurantStatus.SUSPENDED]: "Заблокирован",
  };
  return labels[status] || status;
};

export default function AdminRestaurantsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<
    RestaurantStatus | "ALL"
  >("ALL");
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [moderationNote, setModerationNote] = useState("");

  const { data: restaurants = [], isLoading } = useAllRestaurants();
  const moderateRestaurant = useModerateRestaurant();

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              У вас нет прав для модерации ресторанов.
            </p>
            <Button onClick={() => router.push("/")}>На главную</Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Статистика
  const filteredRestaurants =
    selectedStatus === "ALL"
      ? restaurants
      : restaurants.filter((r) => r.status === selectedStatus);

  const pendingCount = restaurants.filter(
    (r) => r.status === RestaurantStatus.PENDING
  ).length;
  const approvedCount = restaurants.filter(
    (r) => r.status === RestaurantStatus.APPROVED
  ).length;
  const rejectedCount = restaurants.filter(
    (r) => r.status === RestaurantStatus.REJECTED
  ).length;
  const suspendedCount = restaurants.filter(
    (r) => r.status === RestaurantStatus.SUSPENDED
  ).length;

  // Функции обработки модерации
  const handleModerate = (restaurant: Restaurant) => {
    console.log(
      "Модерация ресторана:",
      restaurant.name,
      "Статус:",
      restaurant.status
    );
    setSelectedRestaurant(restaurant);
    setShowModerationModal(true);
    setModerationNote("");
  };

  const handleView = (restaurant: Restaurant) => {
    console.log("Просмотр ресторана:", restaurant.name);
    // Для админа - открываем модальное окно модерации
    handleModerate(restaurant);
  };

  const handleApprove = async () => {
    if (!selectedRestaurant) return;

    try {
      await moderateRestaurant.mutateAsync({
        id: selectedRestaurant.$id,
        status: RestaurantStatus.APPROVED,
        note: moderationNote,
      });
      setShowModerationModal(false);
    } catch (error) {
      console.error("Ошибка одобрения:", error);
    }
  };

  const handleReject = async () => {
    if (!selectedRestaurant) return;

    try {
      await moderateRestaurant.mutateAsync({
        id: selectedRestaurant.$id,
        status: RestaurantStatus.REJECTED,
        note: moderationNote,
      });
      setShowModerationModal(false);
    } catch (error) {
      console.error("Ошибка отклонения:", error);
    }
  };

  const handleSuspend = async () => {
    if (!selectedRestaurant) return;

    try {
      await moderateRestaurant.mutateAsync({
        id: selectedRestaurant.$id,
        status: RestaurantStatus.SUSPENDED,
        note: moderationNote,
      });
      setShowModerationModal(false);
    } catch (error) {
      console.error("Ошибка блокировки:", error);
    }
  };

  const handleReturnToPending = async () => {
    if (!selectedRestaurant) return;

    try {
      await moderateRestaurant.mutateAsync({
        id: selectedRestaurant.$id,
        status: RestaurantStatus.PENDING,
        note: moderationNote,
      });
      setShowModerationModal(false);
    } catch (error) {
      console.error("Ошибка возврата на доработку:", error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <UtensilsCrossed className="h-6 w-6 mr-3 text-indigo-600" />
                Модерация ресторанов
              </h1>
              <p className="text-gray-600 mt-1">
                Проверка и одобрение новых ресторанов. Всего:{" "}
                {restaurants.length}
              </p>
            </div>

            {(pendingCount > 0 || rejectedCount > 0 || suspendedCount > 0) && (
              <div className="flex space-x-2">
                {pendingCount > 0 && (
                  <Badge variant="warning" className="text-lg px-4 py-2">
                    {pendingCount} на модерации
                  </Badge>
                )}
                {rejectedCount > 0 && (
                  <Badge variant="error" className="text-lg px-4 py-2">
                    {rejectedCount} отклонено
                  </Badge>
                )}
                {suspendedCount > 0 && (
                  <Badge variant="error" className="text-lg px-4 py-2">
                    {suspendedCount} заблокировано
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {restaurants.length}
                  </p>
                  <p className="text-sm text-gray-600">Всего ресторанов</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingCount}
                  </p>
                  <p className="text-sm text-gray-600">На модерации</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {approvedCount}
                  </p>
                  <p className="text-sm text-gray-600">Одобренные</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {rejectedCount}
                  </p>
                  <p className="text-sm text-gray-600">Отклонённые</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent padding="sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {suspendedCount}
                  </p>
                  <p className="text-sm text-gray-600">Заблокированные</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Фильтры */}
          <Card className="mb-6">
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedStatus("ALL")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === "ALL"
                      ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                  }`}
                >
                  Все ({restaurants.length})
                </button>

                <button
                  onClick={() => setSelectedStatus(RestaurantStatus.PENDING)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === RestaurantStatus.PENDING
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                  }`}
                >
                  На модерации ({pendingCount})
                </button>

                <button
                  onClick={() => setSelectedStatus(RestaurantStatus.APPROVED)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === RestaurantStatus.APPROVED
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                  }`}
                >
                  Одобренные ({approvedCount})
                </button>

                <button
                  onClick={() => setSelectedStatus(RestaurantStatus.REJECTED)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === RestaurantStatus.REJECTED
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                  }`}
                >
                  Отклонённые ({rejectedCount})
                </button>

                <button
                  onClick={() => setSelectedStatus(RestaurantStatus.SUSPENDED)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === RestaurantStatus.SUSPENDED
                      ? "bg-orange-100 text-orange-700 border border-orange-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent"
                  }`}
                >
                  Заблокированные ({suspendedCount})
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Отладочная информация */}
          {process.env.NODE_ENV === "development" && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent>
                <p className="text-blue-800 text-sm">
                  <strong>Отладка:</strong> Загружено {restaurants.length}{" "}
                  ресторанов.
                  <br />
                  <strong>Статусы:</strong>{" "}
                  {restaurants.map((r) => `${r.name}(${r.status})`).join(", ")}
                  <br />
                  <strong>Фильтр:</strong> {selectedStatus} |{" "}
                  <strong>Показано:</strong> {filteredRestaurants.length}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Сетка ресторанов */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <div key={restaurant.$id} className="relative">
                  <RestaurantCard
                    restaurant={restaurant}
                    showStatus
                    onModerate={handleModerate}
                    onView={handleView}
                  />

                  {/* Дополнительная кнопка модерации для наглядности */}
                  {(restaurant.status === RestaurantStatus.PENDING ||
                    restaurant.status === RestaurantStatus.REJECTED ||
                    restaurant.status === RestaurantStatus.SUSPENDED) && (
                    <div className="absolute top-4 right-4 z-10">
                      <Button
                        size="sm"
                        onClick={() => handleModerate(restaurant)}
                        className={`
                          ${
                            restaurant.status === RestaurantStatus.PENDING
                              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                              : restaurant.status === RestaurantStatus.REJECTED
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-orange-500 hover:bg-orange-600 text-white"
                          }
                        `}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Рестораны не найдены
                  </h3>
                  <p className="text-gray-500">
                    Нет ресторанов с выбранным статусом "{selectedStatus}"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Модальное окно модерации */}
          <Modal
            isOpen={showModerationModal}
            onClose={() => setShowModerationModal(false)}
            title={`Модерация: ${selectedRestaurant?.name}`}
            size="lg"
          >
            {selectedRestaurant && (
              <div className="space-y-6">
                {/* Информация о ресторане */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Информация о ресторане
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <strong>Название:</strong> {selectedRestaurant.name}
                      </p>
                      <p>
                        <strong>Телефон:</strong> {selectedRestaurant.phone}
                      </p>
                      <p>
                        <strong>Email:</strong> {selectedRestaurant.email}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Кухня:</strong>{" "}
                        {selectedRestaurant.cuisineType.join(", ")}
                      </p>
                      <p>
                        <strong>Ценовая категория:</strong>{" "}
                        {selectedRestaurant.priceRange}
                      </p>
                      <p>
                        <strong>Город:</strong>{" "}
                        {selectedRestaurant.address.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t">
                    <span>
                      <strong>Текущий статус:</strong>
                    </span>
                    <Badge
                      variant={
                        selectedRestaurant.status === RestaurantStatus.APPROVED
                          ? "success"
                          : selectedRestaurant.status ===
                            RestaurantStatus.PENDING
                          ? "warning"
                          : "error"
                      }
                    >
                      {getRestaurantStatusLabel(selectedRestaurant.status)}
                    </Badge>
                  </div>
                </div>

                {/* Предыдущая заметка */}
                {(selectedRestaurant as any).moderationNote && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Предыдущая заметка модератора
                    </h4>
                    <p className="text-sm text-blue-800">
                      {(selectedRestaurant as any).moderationNote}
                    </p>
                  </div>
                )}

                {/* Поле для комментария */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Комментарий для владельца ресторана
                  </label>
                  <textarea
                    value={moderationNote}
                    onChange={(e) => setModerationNote(e.target.value)}
                    rows={4}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Оставьте комментарий для владельца ресторана..."
                  />
                </div>

                {/* Кнопки действий */}
                <div className="space-y-3">
                  {selectedRestaurant.status === RestaurantStatus.PENDING && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleApprove}
                        loading={moderateRestaurant.isPending}
                        icon={CheckCircle}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        ✅ Одобрить ресторан
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReject}
                        loading={moderateRestaurant.isPending}
                        icon={XCircle}
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        ❌ Отклонить ресторан
                      </Button>
                    </div>
                  )}

                  {selectedRestaurant.status === RestaurantStatus.APPROVED && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={handleReject}
                        loading={moderateRestaurant.isPending}
                        icon={XCircle}
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        ❌ Отклонить ресторан
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSuspend}
                        loading={moderateRestaurant.isPending}
                        className="flex-1 text-orange-600 border-orange-600 hover:bg-orange-50"
                      >
                        🔒 Заблокировать
                      </Button>
                    </div>
                  )}

                  {selectedRestaurant.status === RestaurantStatus.REJECTED && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleApprove}
                        loading={moderateRestaurant.isPending}
                        icon={CheckCircle}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        ✅ Одобрить ресторан
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReturnToPending}
                        loading={moderateRestaurant.isPending}
                        className="flex-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        🔄 Вернуть на доработку
                      </Button>
                    </div>
                  )}

                  {selectedRestaurant.status === RestaurantStatus.SUSPENDED && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleApprove}
                        loading={moderateRestaurant.isPending}
                        icon={CheckCircle}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        ✅ Активировать ресторан
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReject}
                        loading={moderateRestaurant.isPending}
                        icon={XCircle}
                        className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                      >
                        ❌ Отклонить навсегда
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </Layout>
  );
}
