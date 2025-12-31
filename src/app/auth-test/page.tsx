"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

export default function Home() {
  const { loginWithRedirect, logout, user, getAccessTokenSilently } =
    useAuth0();
  const [apiResult, setApiResult] = useState<string>("");

  async function callWhoAmI() {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE!,
          scope: "openid profile email",
        },
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/whoami`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setApiResult(await res.text());
    } catch (e: any) {
      const message = String(e?.message ?? e);
      if (message.toLowerCase().includes("consent")) {
        // One-time interactive consent
        await loginWithRedirect({
          authorizationParams: {
            audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE!,
            scope: "openid profile email",
            prompt: "consent",
          },
        });
        return;
      }

      // Optional: popup fallback if you prefer
      // const token = await getAccessTokenWithPopup({ authorizationParams: {...} });

      throw e;
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Spec Agent Auth Test</h1>

      {/* {!isAuthenticated ? ( */}
      <button onClick={() => loginWithRedirect()}>Log in</button>
      {/* ) : ( */}
      <>
        <div style={{ marginTop: 12 }}>
          <div>Logged in as: {user?.email ?? user?.name ?? "(no email)"}</div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <button onClick={callWhoAmI}>Call /whoami</button>
          <button
            onClick={() =>
              logout({
                logoutParams: { returnTo: window.location.origin },
              })
            }
          >
            Log out
          </button>
        </div>

        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{apiResult}</pre>
      </>
      {/* )} */}
    </main>
  );
}
