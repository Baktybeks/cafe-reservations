// src/components/admin/UserManagement.tsx
// Компонент для управления пользователями (админка)

"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { appwriteService } from "@/services/appwriteService";
import { useNotificationStore } from "@/store/appStore";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Shield,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { User, UserRole } from "@/types";

export function UserManagement() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "ALL">("ALL");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Получаем список пользователей
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", searchQuery, selectedRole],
    queryFn: async () => {
      const allUsers = await appwriteService.getUsers();

      let filteredUsers = allUsers;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
      }

      if (selectedRole !== "ALL") {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === selectedRole
        );
      }

      return filteredUsers;
    },
    staleTime: 1000 * 60 * 2,
  });

  // Мутация для обновления пользователя
  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<User>;
    }) => appwriteService.updateUserDocument(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      addNotification({
        type: "success",
        title: "Пользователь обновлен",
        message: "Данные пользователя успешно обновлены",
      });
      setShowUserModal(false);
    },
    onError: (error: any) => {
      addNotification({
        type: "error",
        title: "Ошибка обновления",
        message: error.message || "Не удалось обновить пользователя",
      });
    },
  });

  const handleToggleActive = (user: User) => {
    updateUserMutation.mutate({
      userId: user.$id,
      updates: { isActive: !user.isActive },
    });
  };

  const handleRoleChange = (user: User, newRole: UserRole) => {
    updateUserMutation.mutate({
      userId: user.$id,
      updates: { role: newRole },
    });
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

  const getRoleLabel = (role: UserRole) => {
    const labels = {
      [UserRole.ADMIN]: "Администратор",
      [UserRole.RESTAURANT_OWNER]: "Владелец ресторана",
      [UserRole.CUSTOMER]: "Клиент",
    };
    return labels[role];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Управление пользователями
          </h2>
          <p className="text-gray-600 mt-1">
            Всего пользователей: {users.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Поиск по имени или email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>

            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as UserRole | "ALL")
              }
              className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="ALL">Все роли</option>
              <option value={UserRole.ADMIN}>Администраторы</option>
              <option value={UserRole.RESTAURANT_OWNER}>
                Владельцы ресторанов
              </option>
              <option value={UserRole.CUSTOMER}>Клиенты</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent padding="none">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Загрузка пользователей...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Пользователь
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата регистрации
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.$id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-700">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500">
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.isActive ? "success" : "error"}>
                          {user.isActive ? "Активен" : "Заблокирован"}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(user.$createdAt).toLocaleDateString("ru-RU")}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            icon={Eye}
                          >
                            Просмотр
                          </Button>

                          <Button
                            variant={user.isActive ? "outline" : "success"}
                            size="sm"
                            onClick={() => handleToggleActive(user)}
                            icon={user.isActive ? UserX : UserCheck}
                          >
                            {user.isActive ? "Заблокировать" : "Активировать"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Пользователи не найдены
              </h3>
              <p className="text-gray-500">
                Попробуйте изменить параметры поиска
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={`Пользователь: ${selectedUser?.name}`}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Имя</label>
                <p className="text-gray-900">{selectedUser.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>

              {selectedUser.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Телефон
                  </label>
                  <p className="text-gray-900">{selectedUser.phone}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Роль
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    handleRoleChange(selectedUser, e.target.value as UserRole)
                  }
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value={UserRole.CUSTOMER}>Клиент</option>
                  <option value={UserRole.RESTAURANT_OWNER}>
                    Владелец ресторана
                  </option>
                  <option value={UserRole.ADMIN}>Администратор</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Статус
                </label>
                <p className="text-gray-900">
                  <Badge variant={selectedUser.isActive ? "success" : "error"}>
                    {selectedUser.isActive ? "Активен" : "Заблокирован"}
                  </Badge>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Дата регистрации
                </label>
                <p className="text-gray-900">
                  {new Date(selectedUser.$createdAt).toLocaleDateString(
                    "ru-RU"
                  )}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                variant={selectedUser.isActive ? "outline" : "success"}
                onClick={() => handleToggleActive(selectedUser)}
                icon={selectedUser.isActive ? UserX : UserCheck}
                loading={updateUserMutation.isPending}
              >
                {selectedUser.isActive
                  ? "Заблокировать пользователя"
                  : "Активировать пользователя"}
              </Button>

              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                Закрыть
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
