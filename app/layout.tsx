/**
 * Root Layout Component
 * 
 * The root layout for the entire Next.js application. Wraps all pages with
 * necessary providers (Theme, Sidebar) and applies global styles and fonts.
 * Sets up the HTML structure and metadata for the application.
 * 
 * @layout
 */

import { Suspense } from "react";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { SidebarProvider } from "./components/SidebarContext";
import LayoutWrapper from "./components/LayoutWrapper";
import { GameFilterProvider } from "./components/GameFilterContext";
import type { Metadata } from "next";
import { MedievalSharp } from "next/font/google";
import Loading from "./components/Loading";

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

type RootLayoutProps = {
    children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`flex h-screen ${medievalSharp.className}`}>
                <GameFilterProvider>
                    <StackProvider app={stackClientApp}>
                        <StackTheme>
                            <Suspense fallback={<Loading />}>
                                <ThemeProvider>
                                    <SidebarProvider>
                                        <LayoutWrapper>
                                            {children}
                                        </LayoutWrapper>
                                    </SidebarProvider>
                                </ThemeProvider>
                            </Suspense>
                        </StackTheme>
                    </StackProvider>
                </GameFilterProvider>
            </body>
        </html>
    );
}
