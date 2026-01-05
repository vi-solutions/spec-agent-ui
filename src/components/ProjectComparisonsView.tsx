"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { useApi } from "@/hooks/use-api";
import type { SpecComparisonRow } from "@/lib/api";

type Status = "idle" | "loading" | "error";

export default function ProjectComparisonsView(props: { projectId: string }) {
  const { projectId } = props;

  const [comparisons, setComparisons] = useState<SpecComparisonRow[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const api = useApi();
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    let cancelled = false;

    if (isLoading || !isAuthenticated) {
      return;
    }

    async function load() {
      setStatus("loading");
      setError(null);

      try {
        const data = await api.listComparisons(projectId);
        if (!cancelled) {
          setComparisons(data);
          setStatus("idle");
        }
      } catch (e) {
        if (!cancelled) {
          setStatus("error");
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [api, isAuthenticated, isLoading, projectId]);

  async function refresh() {
    setStatus("loading");
    setError(null);

    try {
      const data = await api.listComparisons(projectId);
      setComparisons(data);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function runComparison() {
    setStatus("loading");
    setError(null);

    try {
      await api.runComparison(projectId);
      const data = await api.listComparisons(projectId);
      setComparisons(data);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex gap-2">
          <div className="font-semibold">Comparisons</div>
          <div className="text-slate-500">({comparisons.length})</div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => void runComparison()}
            disabled={status === "loading"}
            variant="primary"
            size="sm"
          >
            Run comparison
          </Button>

          <Button
            onClick={() => void refresh()}
            disabled={status === "loading"}
            variant="secondary"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}

      <div className="mt-4 space-y-2">
        {comparisons.map((c) => (
          <div
            key={c.id}
            className="rounded-lg border border-slate-100 px-3 py-2 bg-input"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">
                  {c.model_name}
                  {c.prompt_version ? ` • ${c.prompt_version}` : ""}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(c.created_at).toLocaleString()} • {c.status}
                </div>
                {c.error ? (
                  <div className="mt-1 text-sm text-red-600">{c.error}</div>
                ) : null}
              </div>

              <Link
                href={`/projects/${encodeURIComponent(
                  projectId
                )}/comparisons/${encodeURIComponent(c.id)}`}
              >
                <Button type="button" variant="secondary" size="sm">
                  View report
                </Button>
              </Link>
            </div>
          </div>
        ))}

        {comparisons.length === 0 && status !== "loading" ? (
          <div className="text-sm text-slate-500">No comparisons yet.</div>
        ) : null}
      </div>
    </Card>
  );
}
