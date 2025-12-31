"use client";

import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function normalizeReturnTo(raw: string | null | undefined): string {
  if (!raw) {
    return "/";
  }

  // Prevent open redirects; keep navigation inside this app.
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }

  return "/";
}

export function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // Avoid redirect loops.
    if (pathname === "/login") {
      return;
    }

    if (isAuthenticated) {
      return;
    }

    const qs = searchParams.toString();
    const returnTo = normalizeReturnTo(qs ? `${pathname}?${qs}` : pathname);
    router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }, [isAuthenticated, isLoading, pathname, router, searchParams]);

  return null;
}
