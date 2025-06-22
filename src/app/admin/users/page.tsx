// src/app/admin/users/page.tsx
// Страница управления пользователями для админа

"use client";

import React from "react";
import Layout from "@/components/common/Layout";
import { UserManagement } from "@/components/admin/UserManagement";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();

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
              У вас нет прав для доступа к управлению пользователями.
            </p>
            <Button onClick={() => router.push("/")}>На главную</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserManagement />
        </div>
      </div>
    </Layout>
  );
}
