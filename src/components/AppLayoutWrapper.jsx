"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function AppLayoutWrapper({ children }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login" || pathname === "/syllabus") {
    return (
      <main className="flex-1 w-full overflow-y-auto">{children}</main>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#f0f0f0]">
      <Sidebar />
      <main 
        className="flex h-[100dvh] w-full flex-1 flex-col overflow-hidden px-3 pb-3 md:px-5 md:pb-5"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)'
        }}
      >
        <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:rounded-[2rem]">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          {/* MobileNav is now integrated inside the white container */}
          <div className="block md:hidden shrink-0 border-t border-gray-100 bg-white">
            <MobileNav />
          </div>
        </div>
      </main>
    </div>
  );
}