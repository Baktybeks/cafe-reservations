// src/app/admin/analytics/page.tsx
// Страница аналитики для админа

"use client";

import React, { useState } from "react";
import Layout from "@/components/common/Layout";
import { DashboardStats } from "@/components/analytics/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart3,
  Users,
  UtensilsCrossed,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  Download,
} from "lucide-react";
import { UserRole } from "@/types";
import { useRouter } from "next/navigation";

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState("30d");

  if (!user || user.role !== UserRole.ADMIN) {
    router.push("/");
    return null;
  }

  // Здесь будут реальные данные из API
  const stats = [
    {
      title: "Всего пользователей",
      value: 1234,
      change: 12.5,
      trend: "up" as const,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Активных ресторанов",
      value: 89,
      change: 8.2,
      trend: "up" as const,
      icon: UtensilsCrossed,
      color: "bg-green-500",
    },
    {
      title: "Бронирований",
      value: 5678,
      change: -2.1,
      trend: "down" as const,
      icon: Calendar,
      color: "bg-yellow-500",
    },
    {
      title: "Средний рейтинг",
      value: "4.8",
      change: 0.3,
      trend: "up" as const,
      icon: Star,
      color: "bg-purple-500",
    },
  ];

  const handleExportReport = () => {
    // Логика экспорта отчета
    console.log("Экспорт отчета...");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-6 w-6 mr-3 text-indigo-600" />
                Аналитика платформы
              </h1>
              <p className="text-gray-600 mt-1">
                Общая статистика и метрики работы платформы
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="7d">Последние 7 дней</option>
                <option value="30d">Последние 30 дней</option>
                <option value="90d">Последние 90 дней</option>
                <option value="1y">Последний год</option>
              </select>

              <Button
                variant="outline"
                onClick={handleExportReport}
                icon={Download}
              >
                Экспорт отчета
              </Button>
            </div>
          </div>

          {/* Stats */}
          <DashboardStats
            stats={stats}
            period={
              period === "7d"
                ? "За последние 7 дней"
                : period === "30d"
                ? "За последние 30 дней"
                : period === "90d"
                ? "За последние 90 дней"
                : "За последний год"
            }
          />

          {/* Charts and additional analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Рост пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  График будет здесь
                  <br />
                  (интеграция с Chart.js или Recharts)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Популярные кухни</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Диаграмма будет здесь
                  <br />
                  (интеграция с Chart.js или Recharts)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Бронирования по дням</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  График бронирований
                  <br />
                  (интеграция с Chart.js или Recharts)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Топ ресторанов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                          {item}
                        </div>
                        <span className="text-sm text-gray-900">
                          Ресторан #{item}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          4.{9 - item}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
