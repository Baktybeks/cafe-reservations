// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/types";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  console.log(`🛡️ Middleware: проверка пути ${path}`);

  // Получаем auth cookie
  const authSession = request.cookies.get("auth-storage");
  console.log("🍪 Auth cookie найден:", !!authSession);

  let user = null;

  if (authSession) {
    try {
      const parsed = JSON.parse(authSession.value);
      user = parsed.state?.user;
      console.log(
        "👤 Пользователь из cookie:",
        user
          ? {
              id: user.$id,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            }
          : null
      );
    } catch (error) {
      console.error("❌ Ошибка при разборе auth-session:", error);
    }
  }

  const isAuthenticated = !!user && user.$id && user.email && user.role;
  const isActive = user?.isActive === true;

  console.log("🔍 Статус авторизации:", {
    isAuthenticated,
    isActive,
    userRole: user?.role,
    path,
  });

  // Публичные страницы и API маршруты
  const publicPaths = ["/", "/restaurants", "/login", "/register"];
  const isPublicPath = publicPaths.some(
    (publicPath) =>
      path === publicPath ||
      path.startsWith("/api") ||
      path.startsWith("/_next")
  );

  // API маршруты и статические файлы пропускаем
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Страницы авторизации - если пользователь уже авторизован, перенаправляем
  if (path.startsWith("/login") || path.startsWith("/register")) {
    if (isAuthenticated && isActive) {
      console.log("✅ Пользователь уже авторизован, перенаправляем по роли");
      return redirectByRole(user.role, request);
    }
    console.log("📄 Доступ к странице авторизации разрешен");
    return NextResponse.next();
  }

  // Публичные страницы доступны всем
  if (isPublicPath) {
    console.log("🌐 Публичная страница, доступ разрешен");
    return NextResponse.next();
  }

  // Проверка авторизации для защищенных маршрутов
  if (!isAuthenticated || !isActive) {
    console.log("🚫 Неавторизованный доступ, перенаправляем на /login");
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Проверка прав доступа по ролям
  if (path.startsWith("/admin")) {
    if (user.role !== UserRole.ADMIN) {
      console.log("🚫 Недостаточно прав для /admin, перенаправляем по роли");
      return redirectByRole(user.role, request);
    }
    console.log("✅ Доступ к /admin разрешен для ADMIN");
  }

  if (path.startsWith("/restaurant-owner")) {
    if (![UserRole.ADMIN, UserRole.RESTAURANT_OWNER].includes(user.role)) {
      console.log(
        "🚫 Недостаточно прав для /restaurant-owner, перенаправляем по роли"
      );
      return redirectByRole(user.role, request);
    }
    console.log("✅ Доступ к /restaurant-owner разрешен");
  }

  if (path.startsWith("/customer")) {
    if (![UserRole.ADMIN, UserRole.CUSTOMER].includes(user.role)) {
      console.log("🚫 Недостаточно прав для /customer, перенаправляем по роли");
      return redirectByRole(user.role, request);
    }
    console.log("✅ Доступ к /customer разрешен");
  }

  console.log("✅ Доступ разрешен, продолжаем");
  return NextResponse.next();
}

function redirectByRole(role: UserRole, request: NextRequest) {
  let targetPath: string;

  switch (role) {
    case UserRole.ADMIN:
      targetPath = "/admin";
      console.log("👑 Перенаправление ADMIN на /admin");
      break;
    case UserRole.RESTAURANT_OWNER:
      targetPath = "/restaurant-owner";
      console.log("🏪 Перенаправление RESTAURANT_OWNER на /restaurant-owner");
      break;
    case UserRole.CUSTOMER:
      targetPath = "/customer";
      console.log("👤 Перенаправление CUSTOMER на /customer");
      break;
    default:
      targetPath = "/login";
      console.log("❓ Неизвестная роль, перенаправление на /login");
  }

  const url = new URL(targetPath, request.url);
  console.log(
    `🚀 Выполняем редирект: ${request.nextUrl.pathname} → ${targetPath}`
  );
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|public|favicon.ico).*)",
    "/admin/:path*",
    "/restaurant-owner/:path*",
    "/customer/:path*",
    "/login",
    "/register",
    "/",
  ],
};
