"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Video,
  ClipboardList,
  Activity,
  Trophy,
  MessageSquare,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { clearProgressCache } from "@/lib/progress";
import { useChatX } from "@/components/ChatXProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { openChat } = useChatX();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  if (pathname === "/" || pathname === "/login" || pathname === "/syllabus") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      clearProgressCache();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const avatarUrl =
    user?.photoURL ||
    `https://api.dicebear.com/10.x/glyphs/svg?seed=${user?.uid || "guest"}`;

  const navItems = [
    { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
    { href: "/series", icon: Video, label: "Library" },
    { href: "/mcq", icon: ClipboardList, label: "MCQs" },
    { href: "/tracker", icon: Activity, label: "Tracker" },
    { href: "/leaderboard", icon: Trophy, label: "Ranks" },
    { action: openChat, icon: MessageSquare, id: "chat", label: "Discuss" },
  ];

  return (
    <aside className="sticky top-0 hidden h-screen w-[88px] shrink-0 flex-col items-center bg-[#f0f0f0] py-4 pl-4 md:flex">
      <div className="flex h-full w-full flex-col items-center rounded-[2rem] border border-[rgba(30,50,90,0.05)] bg-white py-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        {/* Logo */}
        <div className="relative mb-8 h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-[rgba(30,50,90,0.05)] shadow-sm">
          <Image
            src="/logo/logo black.PNG"
            alt="Logo"
            fill
            className="object-cover scale-110"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        {/* Nav */}
        <nav className="flex w-full flex-1 flex-col items-center gap-1.5 px-2">
          {navItems.map((item) => {
            const isActive = item.href ? pathname.startsWith(item.href) : false;

            const inner = (
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-transform duration-200"
                />
              </div>
            );

            return (
              <div key={item.href || item.id} className="relative w-full">
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex w-full justify-center"
                    title={item.label}
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    onClick={item.action}
                    className="flex w-full justify-center"
                    title={item.label}
                  >
                    {inner}
                  </button>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom: Avatar + Logout */}
        <div className="mt-auto flex flex-col items-center gap-3 px-2">
          <div className="h-8 w-8 overflow-hidden rounded-full border border-[rgba(30,50,90,0.08)] shadow-sm">
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <button
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}