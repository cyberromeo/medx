"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { clearProgressCache } from "@/lib/progress";

const CHECK_INTERVAL_MS = 5000;

const isProtectedPath = (pathname) => {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/leaderboard" ||
    pathname.startsWith("/leaderboard/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/discuss" ||
    pathname.startsWith("/discuss/") ||
    pathname.startsWith("/watch/") ||
    pathname.startsWith("/series/")
  );
};

export default function SessionGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const checkingRef = useRef(false);
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (pathname === "/login") {
      redirectingRef.current = false;
      return;
    }

    if (!isProtectedPath(pathname)) {
      return;
    }

    const forceLogout = () => {
      if (redirectingRef.current) return;
      redirectingRef.current = true;
      clearProgressCache();
      
      signOut(auth)
        .catch(() => {})
        .finally(() => {
          router.replace("/login");
        });
    };

    const validateSession = () => {
      if (checkingRef.current || !auth.currentUser) return;
      
      checkingRef.current = true;
      const localSessionId = localStorage.getItem("sessionId");

      const userRef = doc(db, "users", auth.currentUser.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const activeSessionId = docSnap.data().activeSessionId;
            if (activeSessionId && localSessionId !== activeSessionId) {
              forceLogout();
            }
          }
        })
        .catch(() => {})
        .finally(() => {
          checkingRef.current = false;
        });
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        validateSession();
      } else {
        forceLogout();
      }
    });

    const intervalId = window.setInterval(validateSession, CHECK_INTERVAL_MS);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        validateSession();
      }
    };
    window.addEventListener("focus", validateSession);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      unsubscribe();
      window.clearInterval(intervalId);
      window.removeEventListener("focus", validateSession);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname, router]);

  return null;
}
