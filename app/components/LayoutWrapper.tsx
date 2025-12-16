"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BrandNav from "./BrandNav";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  if (isLandingPage) {
    return (
      <div className="flex-1 w-full">
        {children}
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="flex flex-col flex-1 transition-all duration-300">
        <Navbar />
        <BrandNav />
        <main className="flex-1 overflow-y-auto p-0 min-h-0 transition-all duration-300">
          {children}
        </main>
      </div>
    </>
  );
}

