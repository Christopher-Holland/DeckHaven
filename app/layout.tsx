// src/app/layout.tsx
import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { ThemeProvider } from "./components/ThemeProvider";
import { SidebarProvider } from "./components/SidebarContext";
import type { Metadata } from "next";
import BrandNav from "./components/BrandNav";
import { MedievalSharp } from "next/font/google";

const medievalSharp = MedievalSharp({
  subsets: ["latin"],
  weight: ["400"],
});

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
      <body className={`flex h-screen ${medievalSharp.className}`}>
        <ThemeProvider>
          <SidebarProvider>
            <Sidebar />
            <div className="flex flex-col flex-1 transition-all duration-300">
              <Navbar />
              <BrandNav />
              <main className="flex-1 overflow-y-auto p-0 min-h-0 transition-all duration-300">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}