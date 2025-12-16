// src/app/layout.tsx
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { SidebarProvider } from "./components/SidebarContext";
import LayoutWrapper from "./components/LayoutWrapper";
import type { Metadata } from "next";
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
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}