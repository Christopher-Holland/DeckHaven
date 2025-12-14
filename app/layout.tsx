// src/app/layout.tsx
import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { ThemeProvider } from "./components/ThemeProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DeckHaven",
  icons: {
    icon: [
      { url: "/OrbIcon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen">
        <ThemeProvider>
          <Sidebar />
          <div className="flex flex-col flex-1">
            <Navbar />
            <main className="p-6 overflow-y-auto bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}