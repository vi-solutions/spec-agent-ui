"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@components/ui/Button";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

export function AppHeader() {
  const { isAuthenticated, isLoading, logout, user } = useAuth0();
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <header
      data-app-header
      className="border-b border-slate-200 bg-slate-700 no-print"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <h1 className="text-xl text-slate-200 font-bold">Spec Agent</h1>

        <div className="flex items-center gap-3">
          <div className="hidden text-sm text-slate-300 sm:block">
            {user?.email ?? user?.name ?? ""}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              const next: Theme = theme === "dark" ? "light" : "dark";
              setTheme(next);
              try {
                window.localStorage.setItem("theme", next);
              } catch {
                // ignore
              }
            }}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </Button>

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
