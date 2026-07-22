"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default function AppLayoutWrapper({ children }) {
  const pathname = usePathname();

  if (pathname === "/" || pathname === "/login" || pathname === "/syllabus" || pathname === "/verify-email" || pathname === "/acticode" || pathname === "/studytime") {
    return (
      <main className="flex-1 w-full overflow-y-auto">{children}</main>
    );
  }

  const isMobileNavVisible = !(
    pathname.startsWith("/watch/") ||
    pathname.startsWith("/series/") ||
    (pathname.startsWith("/mcq/") && pathname !== "/mcq")
  );

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#f0f0f0]">
      <Sidebar />
      <main 
        className={`flex h-[100dvh] w-full flex-1 flex-col overflow-hidden px-3 md:px-5 md:pb-5 ${isMobileNavVisible ? 'pb-24' : ''}`}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)',
          paddingBottom: isMobileNavVisible ? undefined : 'calc(env(safe-area-inset-bottom) + 0.75rem)',
        }}
      >
        <div className="relative h-full w-full flex-1 overflow-y-auto rounded-[1.5rem] border border-[rgba(30,50,90,0.05)] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:rounded-[2rem]">
          {children}
        </div>
      </main>
    </div>
  );
}