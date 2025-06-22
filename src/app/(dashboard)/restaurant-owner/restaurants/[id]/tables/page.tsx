// src/app/(dashboard)/restaurant-owner/restaurants/[id]/tables/page.tsx

"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useRestaurant, useRestaurantTables } from "@/hooks/useRestaurants";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  ToggleLeft,
  ToggleRight,
  Save,
  X,
} from "lucide-react";
import { Table, TableType, getTableTypeLabel, UserRole } from "@/types";

interface TableFormData {
  tableNumber: string;
  capacity: number;
  type: TableType;
  location: string;
  amenities: string[];
  isActive: boolean;
}

export default function RestaurantTablesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const restaurantId = params.id as string;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [newAmenity, setNewAmenity] = useState("");

  const [formData, setFormData] = useState<TableFormData>({
    tableNumber: "",
    capacity: 2,
    type: TableType.INDOOR,
    location: "",
    amenities: [],
    isActive: true,
  });

  const { data: restaurant, isLoading: restaurantLoading } =
    useRestaurant(restaurantId);
  const { data: tables = [], isLoading: tablesLoading } =
    useRestaurantTables(restaurantId);

  // Проверяем права доступа
  if (
    !user ||
    (user.role !== UserRole.RESTAURANT_OWNER && user.role !== UserRole.ADMIN)
  ) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              У вас нет прав для управления столиками
            </p>
            <Button onClick={() => router.push("/")}>На главную</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (restaurantLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!restaurant) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ресторан не найден
            </h1>
            <Button onClick={() => router.push("/restaurant-owner")}>
              К моим ресторанам
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const resetForm = () => {
    setFormData({
      tableNumber: "",
      capacity: 2,
      type: TableType.INDOOR,
      location: "",
      amenities: [],
      isActive: true,
    });
    setNewAmenity("");
  };

  const handleCreate = () => {
    resetForm();
    setEditingTable(null);
    setShowCreateModal(true);
  };

  const handleEdit = (table: Table) => {
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      type: table.type,
      location: table.location || "",
      amenities: table.amenities || [],
      isActive: table.isActive,
    });
    setEditingTable(table);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingTable(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Здесь будет логика создания/обновления столика
    console.log("Saving table:", formData);

    // Закрываем модал после успешного сохранения
    handleCloseModal();
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((a) => a !== amenity),
    }));
  };

  const toggleTableStatus = (table: Table) => {
    // Здесь будет логика переключения статуса столика
    console.log("Toggle table status:", table.$id, !table.isActive);
  };

  const deleteTable = (table: Table) => {
    if (
      confirm(`Вы уверены, что хотите удалить столик ${table.tableNumber}?`)
    ) {
      // Здесь будет логика удаления столика
      console.log("Delete table:", table.$id);
    }
  };

  // Группировка столиков по типу
  const tablesByType = tables.reduce((acc, table) => {
    if (!acc[table.type]) {
      acc[table.type] = [];
    }
    acc[table.type].push(table);
    return acc;
  }, {} as Record<TableType, Table[]>);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/restaurant-owner")}
                  icon={ArrowLeft}
                >
                  Назад
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Управление столиками
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {restaurant.name} • {tables.length} столиков
                  </p>
                </div>
              </div>

              <Button onClick={handleCreate} icon={Plus}>
                Добавить столик
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent padding="md">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Всего столиков
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {tables.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="md">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Активных
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {tables.filter((t) => t.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="md">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-amber-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Общая вместимость
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {tables.reduce((sum, table) => sum + table.capacity, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent padding="md">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Типов зон
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Object.keys(tablesByType).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tables List */}
          {tablesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : tables.length > 0 ? (
            <div className="space-y-8">
              {Object.entries(tablesByType).map(([type, typeTables]) => (
                <div key={type}>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    {getTableTypeLabel(type as TableType)} ({typeTables.length})
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {typeTables.map((table) => (
                      <Card
                        key={table.$id}
                        className={!table.isActive ? "opacity-60" : ""}
                      >
                        <CardContent>
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                Столик {table.tableNumber}
                              </h3>
                              <div className="flex items-center mt-1">
                                <Users className="h-4 w-4 text-gray-400 mr-1" />
                                <span className="text-sm text-gray-600">
                                  До {table.capacity} человек
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={table.isActive ? "success" : "error"}
                                size="sm"
                              >
                                {table.isActive ? "Активен" : "Отключен"}
                              </Badge>
                            </div>
                          </div>

                          {table.location && (
                            <div className="flex items-center mb-3">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600">
                                {table.location}
                              </span>
                            </div>
                          )}

                          {table.amenities && table.amenities.length > 0 && (
                            <div className="mb-4">
                              <div className="flex flex-wrap gap-1">
                                {table.amenities
                                  .slice(0, 3)
                                  .map((amenity, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      size="sm"
                                    >
                                      {amenity}
                                    </Badge>
                                  ))}
                                {table.amenities.length > 3 && (
                                  <Badge variant="secondary" size="sm">
                                    +{table.amenities.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <button
                              onClick={() => toggleTableStatus(table)}
                              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                            >
                              {table.isActive ? (
                                <ToggleRight className="h-4 w-4 mr-1 text-green-600" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 mr-1 text-gray-400" />
                              )}
                              {table.isActive ? "Отключить" : "Включить"}
                            </button>

                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(table)}
                                icon={Edit}
                              >
                                Изменить
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTable(table)}
                                icon={Trash2}
                                className="text-red-600 hover:text-red-700"
                              >
                                Удалить
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Нет столиков
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Добавьте столики, чтобы клиенты могли делать бронирования
                  </p>
                  <Button onClick={handleCreate} icon={Plus}>
                    Добавить первый столик
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          title={editingTable ? "Редактировать столик" : "Добавить столик"}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Номер столика"
                value={formData.tableNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tableNumber: e.target.value,
                  }))
                }
                placeholder="1, А1, VIP-1"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Вместимость
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      capacity: Number(e.target.value),
                    }))
                  }
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? "человек" : "человека"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип зоны
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: e.target.value as TableType,
                  }))
                }
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                {Object.values(TableType).map((type) => (
                  <option key={type} value={type}>
                    {getTableTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Расположение"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              placeholder="У окна, в центре зала, терраса"
              icon={MapPin}
            />

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Особенности столика
              </label>

              <div className="flex space-x-2 mb-3">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Добавить особенность"
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAmenity();
                    }
                  }}
                />
                <Button type="button" onClick={addAmenity} icon={Plus}>
                  Добавить
                </Button>
              </div>

              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => removeAmenity(amenity)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Активен для бронирования
                </label>
                <p className="text-sm text-gray-500">
                  Клиенты смогут выбрать этот столик при бронировании
                </p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" fullWidth icon={Save}>
                {editingTable ? "Сохранить изменения" : "Создать столик"}
              </Button>

              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={handleCloseModal}
              >
                Отмена
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
