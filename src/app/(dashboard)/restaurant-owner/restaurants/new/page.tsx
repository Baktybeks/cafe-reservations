// src/app/(dashboard)/restaurant-owner/restaurants/new/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useCreateRestaurant } from "@/hooks/useRestaurants";
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Settings,
  Image as ImageIcon,
  Plus,
  X,
} from "lucide-react";
import {
  CuisineType,
  PriceRange,
  CreateRestaurantDto,
  WorkingHours,
  DayHours,
  BookingSettings,
  Address,
  getCuisineTypeLabel,
  getPriceRangeLabel,
} from "@/types";

export default function NewRestaurantPage() {
  const router = useRouter();
  const { user } = useAuth();
  const createRestaurant = useCreateRestaurant();

  const [formData, setFormData] = useState<CreateRestaurantDto>({
    name: "",
    description: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Россия",
    },
    phone: "",
    email: "",
    website: "",
    cuisineType: [],
    priceRange: PriceRange.MODERATE,
    images: [],
    workingHours: {
      monday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
      tuesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
      wednesday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
      thursday: { isOpen: true, openTime: "09:00", closeTime: "22:00" },
      friday: { isOpen: true, openTime: "09:00", closeTime: "23:00" },
      saturday: { isOpen: true, openTime: "10:00", closeTime: "23:00" },
      sunday: { isOpen: true, openTime: "10:00", closeTime: "22:00" },
    },
    bookingSettings: {
      isOnlineBookingEnabled: true,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      maxPartySize: 12,
      requirePhoneConfirmation: false,
      autoConfirmBookings: false,
      cancellationPolicy:
        "Отмена бронирования возможна за 2 часа до времени визита.",
    },
    amenities: [],
  });

  const [newAmenity, setNewAmenity] = useState("");
  const [newImage, setNewImage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CreateRestaurantDto],
          [child]: type === "number" ? Number(value) : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleCuisineChange = (cuisine: CuisineType) => {
    setFormData((prev) => ({
      ...prev,
      cuisineType: prev.cuisineType.includes(cuisine)
        ? prev.cuisineType.filter((c) => c !== cuisine)
        : [...prev.cuisineType, cuisine],
    }));
  };

  const handleWorkingHoursChange = (
    day: keyof WorkingHours,
    field: keyof DayHours,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleBookingSettingsChange = (
    field: keyof BookingSettings,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      bookingSettings: {
        ...prev.bookingSettings,
        [field]: value,
      },
    }));
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

  const addImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage.trim()],
      }));
      setNewImage("");
    }
  };

  const removeImage = (image: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== image),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      await createRestaurant.mutateAsync({
        data: formData,
        ownerId: user.$id,
      });

      router.push("/restaurant-owner");
    } catch (error) {
      console.error("Ошибка создания ресторана:", error);
    }
  };

  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.description.trim() &&
      formData.address.street.trim() &&
      formData.address.city.trim() &&
      formData.phone.trim() &&
      formData.email.trim() &&
      formData.cuisineType.length > 0
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UtensilsCrossed className="h-6 w-6 mr-3 text-amber-600" />
              Добавить новый ресторан
            </h1>
            <p className="text-gray-600 mt-2">
              Заполните информацию о вашем ресторане. После модерации он будет
              доступен для бронирования.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Основная информация */}
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Название ресторана"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Название вашего ресторана"
                  icon={UtensilsCrossed}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Расскажите о вашем ресторане, атмосфере, особенностях кухни..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тип кухни
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(CuisineType).map((cuisine) => (
                        <button
                          key={cuisine}
                          type="button"
                          onClick={() => handleCuisineChange(cuisine)}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            formData.cuisineType.includes(cuisine)
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-gray-300 hover:border-gray-400 text-gray-700"
                          }`}
                        >
                          {getCuisineTypeLabel(cuisine)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ценовая категория
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="priceRange"
                      value={formData.priceRange}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      {Object.values(PriceRange).map((range) => (
                        <option key={range} value={range}>
                          {getPriceRangeLabel(range)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Адрес и контакты */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Адрес и контакты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Улица и дом"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="ул. Пушкина, д. 1"
                    required
                  />

                  <Input
                    label="Город"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="Москва"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Регион"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="Московская область"
                  />

                  <Input
                    label="Почтовый индекс"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    placeholder="123456"
                  />

                  <Input
                    label="Страна"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    placeholder="Россия"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Телефон"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+7 (999) 123-45-67"
                    icon={Phone}
                    required
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="info@restaurant.ru"
                    icon={Mail}
                    required
                  />

                  <Input
                    label="Веб-сайт"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://restaurant.ru"
                    icon={Globe}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Время работы */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Время работы
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(formData.workingHours).map(([day, hours]) => {
                    const dayLabels: Record<string, string> = {
                      monday: "Понедельник",
                      tuesday: "Вторник",
                      wednesday: "Среда",
                      thursday: "Четверг",
                      friday: "Пятница",
                      saturday: "Суббота",
                      sunday: "Воскресенье",
                    };

                    return (
                      <div key={day} className="flex items-center space-x-4">
                        <div className="w-24">
                          <span className="text-sm font-medium text-gray-700">
                            {dayLabels[day]}
                          </span>
                        </div>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={hours.isOpen}
                            onChange={(e) =>
                              handleWorkingHoursChange(
                                day as keyof WorkingHours,
                                "isOpen",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="ml-2 text-sm text-gray-600">
                            Открыт
                          </span>
                        </label>

                        {hours.isOpen && (
                          <>
                            <input
                              type="time"
                              value={hours.openTime || ""}
                              onChange={(e) =>
                                handleWorkingHoursChange(
                                  day as keyof WorkingHours,
                                  "openTime",
                                  e.target.value
                                )
                              }
                              className="rounded border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                            <span className="text-gray-500">—</span>
                            <input
                              type="time"
                              value={hours.closeTime || ""}
                              onChange={(e) =>
                                handleWorkingHoursChange(
                                  day as keyof WorkingHours,
                                  "closeTime",
                                  e.target.value
                                )
                              }
                              className="rounded border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Настройки бронирования */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Настройки бронирования
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Онлайн бронирование
                    </label>
                    <p className="text-sm text-gray-500">
                      Разрешить клиентам бронировать столики онлайн
                    </p>
                  </div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.bookingSettings.isOnlineBookingEnabled}
                      onChange={(e) =>
                        handleBookingSettingsChange(
                          "isOnlineBookingEnabled",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Максимум дней для бронирования
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={formData.bookingSettings.maxAdvanceBookingDays}
                      onChange={(e) =>
                        handleBookingSettingsChange(
                          "maxAdvanceBookingDays",
                          Number(e.target.value)
                        )
                      }
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Минимум часов до бронирования
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="72"
                      value={formData.bookingSettings.minAdvanceBookingHours}
                      onChange={(e) =>
                        handleBookingSettingsChange(
                          "minAdvanceBookingHours",
                          Number(e.target.value)
                        )
                      }
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Политика отмены
                  </label>
                  <textarea
                    value={formData.bookingSettings.cancellationPolicy}
                    onChange={(e) =>
                      handleBookingSettingsChange(
                        "cancellationPolicy",
                        e.target.value
                      )
                    }
                    rows={3}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Опишите условия отмены бронирования..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Удобства */}
            <Card>
              <CardHeader>
                <CardTitle>Удобства и особенности</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    placeholder="Добавить удобство (WiFi, Парковка, и т.д.)"
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
              </CardContent>
            </Card>

            {/* Изображения */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Фотографии ресторана
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="URL изображения"
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addImage();
                      }
                    }}
                  />
                  <Button type="button" onClick={addImage} icon={Plus}>
                    Добавить
                  </Button>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Изображение ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Кнопки действий */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                size="lg"
                loading={createRestaurant.isPending}
                disabled={!isFormValid()}
                className="flex-1"
              >
                {createRestaurant.isPending
                  ? "Создаем ресторан..."
                  : "Создать ресторан"}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push("/restaurant-owner")}
                disabled={createRestaurant.isPending}
              >
                Отмена
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
