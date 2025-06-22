// src/app/(dashboard)/settings/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";
import { useAppDataStore } from "@/store/appStore";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Download,
  Upload,
} from "lucide-react";
import { UserRole } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const { clearRecentSearches, recentSearches } = useAppDataStore();

  const [activeTab, setActiveTab] = useState<
    "profile" | "notifications" | "privacy" | "data"
  >("profile");
  const [isLoading, setIsLoading] = useState(false);

  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    bookingConfirmations: true,
    bookingReminders: true,
    promotionalOffers: false,
    reviewRequests: true,
    systemUpdates: true,
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowReviewResponses: true,
    dataCollection: true,
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Доступ запрещен
            </h1>
            <p className="text-gray-600 mb-4">
              Войдите в систему для доступа к настройкам
            </p>
            <Button onClick={() => router.push("/login")}>Войти</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile(profileData);
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    // Здесь будет логика экспорта данных пользователя
    const userData = {
      profile: user,
      settings: {
        notifications: notificationSettings,
        privacy: privacySettings,
      },
      searchHistory: recentSearches,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restaurant-booking-data-${user.email}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо."
      )
    ) {
      // Здесь будет логика удаления аккаунта
      console.log("Deleting account...");
      setShowDeleteModal(false);
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    const labels = {
      [UserRole.ADMIN]: "Администратор",
      [UserRole.RESTAURANT_OWNER]: "Владелец ресторана",
      [UserRole.CUSTOMER]: "Клиент",
    };
    return labels[role];
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  icon={ArrowLeft}
                >
                  Назад
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Настройки
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Управление аккаунтом и предпочтениями
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-6">
              <nav className="flex space-x-8">
                {[
                  { id: "profile", label: "Профиль", icon: User },
                  { id: "notifications", label: "Уведомления", icon: Bell },
                  { id: "privacy", label: "Приватность", icon: Shield },
                  { id: "data", label: "Данные", icon: Download },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                        isActive
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Имя"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      icon={User}
                    />

                    <Input
                      label="Телефон"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>

                  <Input
                    label="Email"
                    value={user.email}
                    disabled
                    helpText="Email нельзя изменить. Обратитесь в поддержку для смены email."
                  />

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="font-medium text-gray-900">
                        Роль в системе
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="info">{getRoleLabel(user.role)}</Badge>
                        <span className="text-sm text-gray-500">
                          Член с{" "}
                          {new Date(user.$createdAt).toLocaleDateString(
                            "ru-RU"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveProfile}
                      loading={isLoading}
                      icon={Save}
                    >
                      Сохранить изменения
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки уведомлений</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Способы доставки
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            Email уведомления
                          </div>
                          <div className="text-sm text-gray-500">
                            Получать уведомления на email
                          </div>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={notificationSettings.emailNotifications}
                            onChange={(e) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                emailNotifications: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            SMS уведомления
                          </div>
                          <div className="text-sm text-gray-500">
                            Получать уведомления по SMS
                          </div>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={notificationSettings.smsNotifications}
                            onChange={(e) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                smsNotifications: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Типы уведомлений
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          key: "bookingConfirmations",
                          label: "Подтверждения бронирований",
                          desc: "Уведомления о статусе ваших бронирований",
                        },
                        {
                          key: "bookingReminders",
                          label: "Напоминания о бронированиях",
                          desc: "Напоминания за час до визита",
                        },
                        {
                          key: "promotionalOffers",
                          label: "Акции и предложения",
                          desc: "Специальные предложения от ресторанов",
                        },
                        {
                          key: "reviewRequests",
                          label: "Запросы отзывов",
                          desc: "Приглашения оставить отзыв после посещения",
                        },
                        {
                          key: "systemUpdates",
                          label: "Системные обновления",
                          desc: "Важные обновления сервиса",
                        },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {setting.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {setting.desc}
                            </div>
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={
                                notificationSettings[
                                  setting.key as keyof typeof notificationSettings
                                ] as boolean
                              }
                              onChange={(e) =>
                                setNotificationSettings((prev) => ({
                                  ...prev,
                                  [setting.key]: e.target.checked,
                                }))
                              }
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button icon={Save}>Сохранить настройки</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Настройки приватности</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Видимость профиля
                        </div>
                        <div className="text-sm text-gray-500">
                          Кто может видеть ваш профиль
                        </div>
                      </div>
                      <select
                        value={privacySettings.profileVisibility}
                        onChange={(e) =>
                          setPrivacySettings((prev) => ({
                            ...prev,
                            profileVisibility: e.target.value,
                          }))
                        }
                        className="rounded border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="public">Публичный</option>
                        <option value="limited">Ограниченный</option>
                        <option value="private">Приватный</option>
                      </select>
                    </div>

                    {[
                      {
                        key: "showEmail",
                        label: "Показывать email",
                        desc: "Другие пользователи смогут видеть ваш email",
                      },
                      {
                        key: "showPhone",
                        label: "Показывать телефон",
                        desc: "Рестораны смогут видеть ваш номер",
                      },
                      {
                        key: "allowReviewResponses",
                        label: "Разрешить ответы на отзывы",
                        desc: "Рестораны могут отвечать на ваши отзывы",
                      },
                      {
                        key: "dataCollection",
                        label: "Сбор аналитических данных",
                        desc: "Помогает улучшить сервис",
                      },
                    ].map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {setting.label}
                          </div>
                          <div className="text-sm text-gray-500">
                            {setting.desc}
                          </div>
                        </div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              privacySettings[
                                setting.key as keyof typeof privacySettings
                              ] as boolean
                            }
                            onChange={(e) =>
                              setPrivacySettings((prev) => ({
                                ...prev,
                                [setting.key]: e.target.checked,
                              }))
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <Button icon={Save}>Сохранить настройки</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Data Management */}
          {activeTab === "data" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Управление данными</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Экспорт данных
                    </h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <Download className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                        <div>
                          <div className="font-medium text-blue-900">
                            Скачать свои данные
                          </div>
                          <div className="text-sm text-blue-700 mt-1">
                            Получите копию всех ваших данных в формате JSON
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      icon={Download}
                    >
                      Экспортировать данные
                    </Button>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Очистка данных
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            История поиска
                          </div>
                          <div className="text-sm text-gray-500">
                            {recentSearches.length} сохраненных запросов
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearRecentSearches}
                          disabled={recentSearches.length === 0}
                        >
                          Очистить
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-red-900 mb-4">
                      Удаление аккаунта
                    </h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <Trash2 className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                        <div>
                          <div className="font-medium text-red-900">
                            Удалить аккаунт навсегда
                          </div>
                          <div className="text-sm text-red-700 mt-1">
                            Это действие нельзя отменить. Все ваши данные будут
                            удалены.
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteModal(true)}
                      icon={Trash2}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Удалить аккаунт
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Удалить аккаунт
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Вы уверены, что хотите удалить свой аккаунт? Все ваши
                          данные, включая бронирования и отзывы, будут удалены
                          навсегда. Это действие нельзя отменить.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    onClick={handleDeleteAccount}
                    className="w-full sm:w-auto sm:ml-3 bg-red-600 hover:bg-red-700"
                  >
                    Удалить аккаунт
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(false)}
                    className="mt-3 w-full sm:mt-0 sm:w-auto"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
