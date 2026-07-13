"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function AppLayoutWrapper({ children }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login" || pathname === "/syllabus") {
    return (
      <main className="flex-1 w-full overflow-y-auto">{children}</main>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f0f0f0]">
      <Sidebar />
      <main className="flex h-screen w-full flex-1 flex-col overflow-hidden p-3 pb-24 md:p-5 md:pb-5">
        <div className="relative h-full w-full flex-1 overflow-y-auto rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:rounded-[2rem]">
          {children}
        </div>
      </main>
    </div>
  );
}