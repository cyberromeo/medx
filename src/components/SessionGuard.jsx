"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
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
      if (redirectingRef.current) {
        return;
      }

      redirectingRef.current = true;
      clearProgressCache();

      void account
        .deleteSession("current")
        .catch(() => {})
        .finally(() => {
          router.replace("/login");
        });
    };

    const validateSession = () => {
      if (checkingRef.current) {
        return;
      }

      checkingRef.current = true;
      void Promise.all([account.getSession("current"), account.getPrefs()])
        .then(([currentSession, prefs]) => {
          const activeSessionId = prefs?.activeSessionId;
          if (activeSessionId && currentSession?.$id !== activeSessionId) {
            forceLogout();
          }
        })
        .catch(() => {
          forceLogout();
        })
        .finally(() => {
          checkingRef.current = false;
        });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        validateSession();
      }
    };

    validateSession();

    const intervalId = window.setInterval(validateSession, CHECK_INTERVAL_MS);
    window.addEventListener("focus", validateSession);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", validateSession);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname, router]);

  return null;
}
