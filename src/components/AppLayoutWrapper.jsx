"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function AppLayoutWrapper({ children }) {
  const pathname = usePathname();
  
  if (pathname === "/" || pathname === "/login") {
    return (
      <main className="flex-1 w-full overflow-y-auto">
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden w-full bg-[#f0f0f0]">
      <Sidebar />
      <main className="flex-1 w-full p-4 pb-[110px] md:p-8 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 w-full h-full bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-y-auto relative">
          {children}
        </div>
      </main>
    </div>
  );
}
