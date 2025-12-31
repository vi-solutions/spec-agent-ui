"use client";

import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";

function normalizeReturnTo(raw: string | null): string {
  if (!raw) {
    return "/";
  }

  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }

  return "/";
}

export default function LoginPage() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user, error } =
    useAuth0();
  const searchParams = useSearchParams();
  const returnTo = normalizeReturnTo(searchParams.get("returnTo"));

  return (
    <main className="min-h-screen flex items-center">
      <div className="mx-auto w-full max-w-lg p-6">
        <Card className="space-y-4">
          <div className="space-y-5">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="text-sm text-slate-400">
              Use your Auth0 account to access Spec Agent.
            </p>
          </div>

          {error ? (
            <div className="text-sm text-red-600">{String(error.message)}</div>
          ) : null}

          {isLoading ? (
            <div className="text-sm text-slate-400">Loading…</div>
          ) : isAuthenticated ? (
            <div className="space-y-3">
              <div className="text-sm">
                Signed in as{" "}
                <span className="font-medium">
                  {user?.email ?? user?.name ?? "(unknown)"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link href={returnTo} className="text-sm">
                  <Button type="button" variant="secondary">
                    Continue
                  </Button>
                </Link>

                <Button
                  type="button"
                  variant="primary"
                  onClick={() =>
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    })
                  }
                >
                  Log out
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                type="button"
                variant="primary"
                onClick={() => loginWithRedirect({ appState: { returnTo } })}
              >
                Log in
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
