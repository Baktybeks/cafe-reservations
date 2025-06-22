// src/components/common/Layout.tsx

"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/store/appStore";
import {
  UtensilsCrossed,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Calendar,
  Settings,
  BarChart3,
  Users,
  Star,
  Heart,
  Search,
} from "lucide-react";
import { UserRole } from "@/types";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showNavbar?: boolean;
}

export default function Layout({
  children,
  title = "RestaurantBooking",
  showNavbar = true,
}: LayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  // Навигационные ссылки в зависимости от роли
  const getNavigationLinks = () => {
    if (!user) {
      return [
        { href: "/", label: "Главная", icon: Home },
        { href: "/restaurants", label: "Рестораны", icon: UtensilsCrossed },
      ];
    }

    switch (user.role) {
      case UserRole.ADMIN:
        return [
          { href: "/admin", label: "Панель управления", icon: BarChart3 },
          {
            href: "/admin/restaurants",
            label: "Рестораны",
            icon: UtensilsCrossed,
          },
          { href: "/admin/users", label: "Пользователи", icon: Users },
          { href: "/admin/bookings", label: "Бронирования", icon: Calendar },
        ];

      case UserRole.RESTAURANT_OWNER:
        return [
          {
            href: "/restaurant-owner",
            label: "Мои рестораны",
            icon: UtensilsCrossed,
          },
          {
            href: "/restaurant-owner/bookings",
            label: "Бронирования",
            icon: Calendar,
          },
        ];

      case UserRole.CUSTOMER:
        return [
          { href: "/customer", label: "Главная", icon: Home },
          {
            href: "/customer/bookings",
            label: "Мои бронирования",
            icon: Calendar,
          },
          { href: "/customer/favorites", label: "Избранное", icon: Heart },
          { href: "/restaurants", label: "Поиск ресторанов", icon: Search },
        ];

      default:
        return [
          { href: "/", label: "Главная", icon: Home },
          { href: "/restaurants", label: "Рестораны", icon: UtensilsCrossed },
        ];
    }
  };

  const navigationLinks = getNavigationLinks();

  const handleLogout = async () => {
    await logout();
    setSidebarOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      {showNavbar && (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  {sidebarOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>

                {/* Logo */}
                <Link href="/" className="flex items-center ml-4 md:ml-0">
                  <UtensilsCrossed className="h-8 w-8 text-indigo-600 mr-2" />
                  <span className="text-xl font-bold text-gray-900">
                    RestaurantBooking
                  </span>
                </Link>

                {/* Desktop navigation */}
                <div className="hidden md:ml-8 md:flex md:space-x-4">
                  {navigationLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-3">
                    {/* User menu */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {user.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        icon={LogOut}
                      >
                        Выйти
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/login")}
                    >
                      Войти
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => router.push("/register")}
                    >
                      Регистрация
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <UtensilsCrossed className="h-6 w-6 text-indigo-600 mr-2" />
                <span className="font-bold text-gray-900">
                  RestaurantBooking
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-gray-600 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4">
              <nav className="space-y-2">
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {user && (
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                    <User className="h-4 w-4 mr-3" />
                    {user.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={handleLogout}
                    icon={LogOut}
                    className="mt-2 justify-start"
                  >
                    Выйти
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © 2024 RestaurantBooking. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}
