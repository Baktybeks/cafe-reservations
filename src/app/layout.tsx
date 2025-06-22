// src/app/layout.tsx

import "./globals.css";
import { Providers } from "./providers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RestaurantBooking - Бронирование столиков в ресторанах",
  description:
    "Найдите и забронируйте столик в лучших ресторанах вашего города. Быстро, удобно, без звонков.",
  keywords: "ресторан, бронирование, столик, еда, кафе, reservations, booking",
  authors: [{ name: "RestaurantBooking Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#4f46e5",
  openGraph: {
    title: "RestaurantBooking - Бронирование столиков",
    description: "Найдите и забронируйте столик в лучших ресторанах",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
