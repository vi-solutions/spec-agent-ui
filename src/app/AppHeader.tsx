"use client";

import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@components/ui/Button";

export function AppHeader() {
  const { isAuthenticated, isLoading, logout, user } = useAuth0();

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <header className="border-b border-slate-200 bg-slate-600">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="font-semibold">
          <h1 className="text-xl font-bold">Spec Agent</h1>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-sm text-slate-300 sm:block">
            {user?.email ?? user?.name ?? ""}
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
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
    </header>
  );
}
