// src/components/common/ErrorBoundary.tsx
// Обработчик ошибок React

"use client";

import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Что-то пошло не так
                </h1>

                <p className="text-gray-600 mb-6">
                  Произошла непредвиденная ошибка. Мы уже работаем над её
                  исправлением.
                </p>

                {process.env.NODE_ENV === "development" && (
                  <div className="text-left bg-gray-100 p-4 rounded-lg mb-6">
                    <p className="text-sm font-mono text-red-600">
                      {this.state.error?.message}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => window.location.reload()}
                    icon={RefreshCw}
                    className="flex-1"
                  >
                    Обновить страницу
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      window.location.href = "/";
                    }}
                    icon={Home}
                    className="flex-1"
                  >
                    На главную
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
