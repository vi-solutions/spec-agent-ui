"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Project } from "@/lib/api";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { useApi } from "@/hooks/use-api";
import { useAuth0 } from "@auth0/auth0-react";

type Status = "idle" | "loading" | "error";

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const canCreate = name.trim().length > 0;
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
        const data = await api.listProjects();
        if (!cancelled) {
          setProjects(data);
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
  }, [api, isAuthenticated, isLoading]);

  async function refresh() {
    setStatus("loading");
    setError(null);

    try {
      const data = await api.listProjects();
      setProjects(data);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const created = await api.createProject({
        name: name.trim(),
        code: code.trim() || undefined,
      });

      setProjects((prev) => [created, ...prev]);
      setName("");
      setCode("");
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <Link
          href="/baselines"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Baselines →
        </Link>
      </div>
      {/* Create project */}
      <form onSubmit={onCreate}>
        <Card>
          <h4 className="font-semibold">Create project</h4>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Job 123"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Code (optional)</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="JOB-123"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Button
              type="submit"
              disabled={!canCreate || status === "loading"}
              variant="primary"
            >
              {status === "loading" ? "Creating..." : "Create"}
            </Button>
          </div>
        </Card>
      </form>

      {/* Projects list */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-baseline">
            <div className="font-semibold">Projects</div>
            <div className="text-slate-400">({projects.length})</div>
          </div>
          <Button
            onClick={() => void refresh()}
            disabled={status === "loading"}
            variant="secondary"
            size="sm"
          >
            Refresh
          </Button>

          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>

        <div className="mt-4 space-y-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${encodeURIComponent(p.id)}`}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 bg-input hover:bg-slate-700"
            >
              <div className="flex flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-slate-400">
                  {p.code ? `Code: ${p.code}` : "No code"}
                </span>
              </div>

              <span className="text-slate-400">→</span>
            </Link>
          ))}

          {projects.length === 0 && status !== "loading" && (
            <div className="text-sm text-slate-400">No projects yet.</div>
          )}
        </div>
      </Card>
    </section>
  );
}
