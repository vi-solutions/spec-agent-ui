"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SpecFile } from "@lib/api";
import { listSpecs, uploadSpec } from "@lib/api";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";

type Status = "idle" | "loading" | "error";

function StatusBadge(props: { status: SpecFile["ingestionStatus"] }) {
  const { status } = props;

  const base =
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";

  switch (status) {
    case "indexed":
      return (
        <span className={`${base} border-emerald-200 text-emerald-700`}>
          INDEXED
        </span>
      );
    case "failed":
      return (
        <span className={`${base} border-red-200 text-red-700`}>FAILED</span>
      );
    case "pending":
    default:
      return (
        <span className={`${base} border-slate-200 text-slate-400`}>
          PENDING
        </span>
      );
  }
}

export default function ProjectSpecsView(props: { projectId: string }) {
  const { projectId } = props;

  const [specs, setSpecs] = useState<SpecFile[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const canUpload = useMemo(() => file != null, [file]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);

      try {
        const data = await listSpecs(projectId);
        if (!cancelled) {
          setSpecs(data);
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
  }, [projectId]);

  async function refresh() {
    setStatus("loading");
    setError(null);

    try {
      const data = await listSpecs(projectId);
      setSpecs(data);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      const created = (await uploadSpec({ projectId, file })) as SpecFile;

      // optimistic insert (you can swap this for `await refresh()` if you prefer canonical)
      setSpecs((prev) => [created, ...prev]);

      // clear local file state + input
      setFile(null);
      const input = document.getElementById(
        "specFile"
      ) as HTMLInputElement | null;
      if (input) {
        input.value = "";
      }

      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <Card>
      <section className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Project</h2>
            <div className="text-xs text-slate-400">ID: {projectId}</div>
          </div>

          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-900"
          >
            ← Back
          </Link>
        </div>

        {/* Upload */}
        <Card>
          <form onSubmit={onUpload}>
            <div className="font-semibold">Upload spec</div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">File</label>
              <input
                id="specFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
              />
              <div className="text-xs text-slate-400">
                Accepted: PDF, DOC, DOCX
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <Button
                type="submit"
                disabled={!canUpload || status === "loading"}
                variant="primary"
              >
                {status === "loading" ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Specs list */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="font-semibold">Specs</div>
              <div className="text-slate-400">{specs.length}</div>
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
            {specs.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-slate-100 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">{s.originalName}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      Created: {new Date(s.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <StatusBadge status={s.ingestionStatus} />
                </div>

                {s.ingestionError ? (
                  <div className="text-sm text-red-600">{s.ingestionError}</div>
                ) : null}
              </div>
            ))}

            {specs.length === 0 && status !== "loading" ? (
              <div className="text-sm text-slate-400">
                No specs uploaded yet.
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </Card>
  );
}
