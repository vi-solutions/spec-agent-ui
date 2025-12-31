"use client";

import { useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { createApi } from "@/lib/api";

export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  return useMemo(() => {
    return createApi(() =>
      getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
          scope: "openid profile email",
        },
      })
    );
  }, [getAccessTokenSilently]);
}
