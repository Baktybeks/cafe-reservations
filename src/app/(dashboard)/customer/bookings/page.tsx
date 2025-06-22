// src/app/(dashboard)/customer/bookings/page.tsx - обновленные импорты

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/common/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { BookingCard } from "@/components/bookings/BookingCard";
import { useAuth } from "@/hooks/useAuth";
import { useUserBookings, useCancelBooking } from "@/hooks/useBookings";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Обновленные импорты типов
import {
  Booking,
  BookingStatus,
  BookingFilters,
  BookingStats,
  getBookingStatusLabel,
} from "@/types";

// Типизированные состояния
export default function CustomerBookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const cancelBooking = useCancelBooking();

  // Типизированное состояние
  const [activeTab, setActiveTab] = useState<
    "all" | "upcoming" | "past" | "cancelled"
  >("upcoming");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "all">(
    "all"
  );
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Получаем типизированные данные
  const {
    data: bookings = [] as Booking[], // Явно указываем тип массива
    isLoading,
    refetch,
  } = useUserBookings(user?.$id || "");

  // Остальной код остается таким же...
  // Фильтрация будет работать с типизированными объектами Booking
}
