// src/app/admin/restaurants/page.tsx
// Страница модерации ресторанов для админа

"use client";

import React, { useState } from "react";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { RestaurantCard } from "@/components/restaurants/RestaurantCard";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurants, useModerateRestaurant } from "@/hooks/useRestaurants";
import {
  Shield,
  UtensilsCrossed,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Restaurant, RestaurantStatus, UserRole } from "@/types";
import { useRouter } from "next/navigation";

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

  const { data: restaurants = [], isLoading } = useRestaurants();
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

  const filteredRestaurants =
    selectedStatus === "ALL"
      ? restaurants
      : restaurants.filter((r) => r.status === selectedStatus);

  const pendingCount = restaurants.filter(
    (r) => r.status === RestaurantStatus.PENDING
  ).length;

  const handleModerate = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowModerationModal(true);
    setModerationNote("");
  };

  const handleApprove = async () => {
    if (!selectedRestaurant) return;

    await moderateRestaurant.mutateAsync({
      id: selectedRestaurant.$id,
      status: RestaurantStatus.APPROVED,
      note: moderationNote,
    });

    setShowModerationModal(false);
  };

  const handleReject = async () => {
    if (!selectedRestaurant) return;

    await moderateRestaurant.mutateAsync({
      id: selectedRestaurant.$id,
      status: RestaurantStatus.REJECTED,
      note: moderationNote,
    });

    setShowModerationModal(false);
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
                Проверка и одобрение новых ресторанов
              </p>
            </div>

            {pendingCount > 0 && (
              <Badge variant="warning" className="text-lg px-4 py-2">
                {pendingCount} на модерации
              </Badge>
            )}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedStatus("ALL")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === "ALL"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Все ({restaurants.length})
                </button>

                <button
                  onClick={() => setSelectedStatus(RestaurantStatus.PENDING)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === RestaurantStatus.PENDING
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  На модерации (
                  {
                    restaurants.filter(
                      (r) => r.status === RestaurantStatus.PENDING
                    ).length
                  }
                  )
                </button>

                <button
                  onClick={() => setSelectedStatus(RestaurantStatus.APPROVED)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === RestaurantStatus.APPROVED
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Одобренные (
                  {
                    restaurants.filter(
                      (r) => r.status === RestaurantStatus.APPROVED
                    ).length
                  }
                  )
                </button>

                <button
                  onClick={() => setSelectedStatus(RestaurantStatus.REJECTED)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === RestaurantStatus.REJECTED
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Отклонённые (
                  {
                    restaurants.filter(
                      (r) => r.status === RestaurantStatus.REJECTED
                    ).length
                  }
                  )
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Restaurants Grid */}
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
                  <RestaurantCard restaurant={restaurant} showStatus />

                  {restaurant.status === RestaurantStatus.PENDING && (
                    <div className="absolute bottom-4 right-4">
                      <Button
                        size="sm"
                        onClick={() => handleModerate(restaurant)}
                        icon={Eye}
                      >
                        Модерировать
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
                    Нет ресторанов с выбранным статусом
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Moderation Modal */}
          <Modal
            isOpen={showModerationModal}
            onClose={() => setShowModerationModal(false)}
            title={`Модерация: ${selectedRestaurant?.name}`}
            size="lg"
          >
            {selectedRestaurant && (
              <div className="space-y-6">
                {/* Restaurant Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Информация о ресторане
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Название:</strong> {selectedRestaurant.name}
                    </p>
                    <p>
                      <strong>Адрес:</strong>{" "}
                      {selectedRestaurant.address.street},{" "}
                      {selectedRestaurant.address.city}
                    </p>
                    <p>
                      <strong>Телефон:</strong> {selectedRestaurant.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedRestaurant.email}
                    </p>
                    <p>
                      <strong>Кухня:</strong>{" "}
                      {selectedRestaurant.cuisineType.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Moderation Note */}
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

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleApprove}
                    loading={moderateRestaurant.isPending}
                    icon={CheckCircle}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Одобрить ресторан
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleReject}
                    loading={moderateRestaurant.isPending}
                    icon={XCircle}
                    className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Отклонить ресторан
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </Layout>
  );
}
