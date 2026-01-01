"use client";

import type { ReactNode } from "react";
import { Auth0Provider } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { AuthGate } from "./AuthGate";
import { AppHeader } from "./AppHeader";

function normalizeReturnTo(raw: unknown): string {
  if (typeof raw !== "string" || raw.length === 0) {
    return "/";
  }

  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }

  return "/";
}

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined" ? window.location.origin : undefined,
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE!,
        scope: "openid profile email",
      }}
      onRedirectCallback={(appState) => {
        router.replace(normalizeReturnTo((appState as any)?.returnTo));
      }}
    >
      <AuthGate />
      <AppHeader />
      {children}
    </Auth0Provider>
  );
}
