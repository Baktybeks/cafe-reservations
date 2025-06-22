// src/components/analytics/DashboardStats.tsx
// Компонент для отображения статистики на дашборде

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  UtensilsCrossed,
  Calendar,
  DollarSign,
  Star,
  Clock,
} from "lucide-react";

interface StatItem {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
  period?: string;
}

export function DashboardStats({
  stats,
  period = "За последние 30 дней",
}: DashboardStatsProps) {
  const formatValue = (value: string | number) => {
    if (typeof value === "number") {
      return new Intl.NumberFormat("ru-RU").format(value);
    }
    return value;
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Статистика</h3>
        <Badge variant="secondary">{period}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatValue(stat.value)}
                    </p>
                    {stat.change !== undefined && (
                      <div
                        className={`flex items-center mt-2 ${getTrendColor(
                          stat.trend
                        )}`}
                      >
                        {getTrendIcon(stat.trend)}
                        <span className="text-sm font-medium ml-1">
                          {stat.change > 0 ? "+" : ""}
                          {stat.change}%
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          vs прошлый период
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-full ${
                      stat.color || "bg-indigo-100"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        stat.color ? "text-white" : "text-indigo-600"
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
