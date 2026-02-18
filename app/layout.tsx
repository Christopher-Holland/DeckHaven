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
import { DeckHavenThemeProvider } from "./components/ThemeContext";
import { SidebarProvider } from "./components/SidebarContext";
import { ToastProvider } from "./components/ToastContext";
import LayoutWrapper from "./components/LayoutWrapper";
import { GameFilterProvider } from "./components/GameFilterContext";
import ToastContainer from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import { DrawerProvider } from "./components/Drawer/drawerProvider";
import { DrawerHost } from "./components/Drawer/DrawerHost";
import { AxeReporter } from "./components/AxeReporter";
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
                                    <DeckHavenThemeProvider>
                                        <ErrorBoundary>
                                            <SidebarProvider>
                                                <ToastProvider>
                                                    <DrawerProvider>
                                                        <AxeReporter />
                                                        <LayoutWrapper>
                                                            {children}
                                                        </LayoutWrapper>
                                                        <ToastContainer />
                                                        <DrawerHost />
                                                    </DrawerProvider>
                                                </ToastProvider>
                                            </SidebarProvider>
                                        </ErrorBoundary>
                                    </DeckHavenThemeProvider>
                                </ThemeProvider>
                            </Suspense>
                        </StackTheme>
                    </StackProvider>
                </GameFilterProvider>
            </body>
        </html>
    );
}
