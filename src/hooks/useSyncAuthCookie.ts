// src/hooks/useSyncAuthCookie.ts

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
export function useSyncAuthCookie() {
  const { user } = useAuthStore();

  useEffect(() => {
    const updateAuthCookie = () => {
      const authData = {
        state: {
          user: user,
        },
      };

      document.cookie = `auth-storage=${encodeURIComponent(
        JSON.stringify(authData)
      )}; path=/; max-age=86400; SameSite=Lax`;
    };

    updateAuthCookie();
  }, [user]);

  useEffect(() => {
    return () => {};
  }, []);
}
