import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ali Scout — Перевір товар до реклами",
  description: "AI читає відгуки і каже: брати чи пропустити. Перевір товар за 10 секунд.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
