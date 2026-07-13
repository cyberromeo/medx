"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  LayoutGrid,
  Video,
  ClipboardList,
  Activity,
  Hexagon,
  LogOut,
  Bell,
  Trophy,
  MessageSquare
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

  if (pathname === "/" || pathname === "/login") {
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

  // Avatar URL logic: use photoURL if set (from settings), otherwise deterministic random glyphs based on UID
  const avatarUrl = user?.photoURL || `https://api.dicebear.com/10.x/glyphs/svg?seed=${user?.uid || 'guest'}`;

  return (
    <aside className="hidden md:flex flex-col items-center w-[110px] h-screen bg-[#f0f0f0] py-4 pl-4 sticky top-0 shrink-0">
      {/* Outer White Container holding the Sidebar */}
      <div className="flex flex-col items-center w-full h-full bg-white rounded-[2rem] py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 relative overflow-visible">
        
        {/* Top Logo Circle */}
        <div className="w-[60px] h-[60px] rounded-full bg-white flex items-center justify-center mb-4 flex-shrink-0 relative overflow-hidden shadow-sm border border-gray-100">
          <Image 
            src="/logo/logo black.PNG" 
            alt="Logo" 
            fill 
            className="object-cover scale-110"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        {/* Main Dark Capsule */}
        <div className="w-[60px] flex-1 bg-[#1c1d29] rounded-[2rem] flex flex-col items-center py-8 relative shadow-lg">
          
          <button className="text-gray-400 hover:text-white transition-colors mb-10 z-10 relative">
            <Menu size={20} />
          </button>

          {/* Navigation Links */}
          <div className="flex flex-col items-center gap-2 w-full z-10">
            {[
              { href: "/dashboard", icon: LayoutGrid },
              { href: "/series", icon: Video },
              { href: "/mcq", icon: ClipboardList },
              { href: "/tracker", icon: Activity },
              { href: "/leaderboard", icon: Trophy },
              { action: openChat, icon: MessageSquare, id: "chat" },
              { href: "/settings", icon: Hexagon },
            ].map((item) => {
              const isActive = item.href ? pathname.startsWith(item.href) : false;
              
              return (
                <div key={item.href || item.id} className="relative w-full h-14 flex items-center justify-center">
                  {isActive ? (
                    <div className="absolute -right-[14px] w-[48px] h-[48px] bg-white rounded-full flex items-center justify-center z-10">
                      <Link href={item.href} className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-sm">
                        <item.icon size={20} strokeWidth={2.5} />
                      </Link>
                    </div>
                  ) : item.href ? (
                    <Link href={item.href} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center w-10 h-10">
                      <item.icon size={20} />
                    </Link>
                  ) : (
                    <button onClick={item.action} className="text-gray-400 hover:text-white transition-colors flex items-center justify-center w-10 h-10">
                      <item.icon size={20} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col items-center gap-6 z-10 relative">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-pink-100 overflow-hidden border border-[#1c1d29] shadow-sm cursor-pointer hover:ring-2 hover:ring-[#1c1d29]/50 transition-all">
               <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
            </div>

            {/* Logout */}
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors mb-2">
              <LogOut size={20} />
            </button>
          </div>

        </div>
      </div>
    </aside>
  );
}
