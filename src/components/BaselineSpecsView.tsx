"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SpecFile } from "@/lib/api";
import { listBaselineSpecs, uploadBaselineSpec } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "loading" | "error";

function StatusBadge(props: { status: SpecFile["ingestionStatus"] }) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";

  switch (props.status) {
    case "indexed":
      return (
        <span
          className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}
        >
          INDEXED
        </span>
      );
    case "failed":
      return (
        <span className={`${base} border-red-200 bg-red-50 text-red-700`}>
          FAILED
        </span>
      );
    case "pending":
    default:
      return (
        <span className={`${base} border-slate-200 bg-slate-50 text-slate-700`}>
          PENDING
        </span>
      );
  }
}

export default function BaselineSpecsView() {
  const [specs, setSpecs] = useState<SpecFile[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      setError(null);

      try {
        const data = await listBaselineSpecs();
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
  }, []);

  async function refresh() {
    setStatus("loading");
    setError(null);

    try {
      const data = await listBaselineSpecs();
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
      const created = (await uploadBaselineSpec(file)) as SpecFile;

      setSpecs((prev) => [created, ...prev]);
      setFile(null);

      const input = document.getElementById(
        "baselineFile"
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

  const canUpload = file != null;

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Baseline specs</h2>
          <p className="text-sm ">
            Baseline specs are global and can be reused across projects.
          </p>
        </div>

        <Link href="/" className="text-sm">
          ← Back
        </Link>
      </div>

      <Card className="space-y-4">
        <div className="font-semibold">Upload baseline spec</div>

        <form onSubmit={onUpload} className="space-y-3">
          <input
            id="baselineFile"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
          />

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              disabled={!canUpload || status === "loading"}
            >
              {status === "loading" ? "Uploading..." : "Upload"}
            </Button>
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex justify-between">
          <div className="flex gap-3 items-center">
            <div className="font-semibold">Baseline library</div>
            <div className="text-sm ">({specs.length})</div>
          </div>
          <Button
            type="button"
            onClick={() => void refresh()}
            disabled={status === "loading"}
            size="sm"
          >
            Refresh
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          {specs.map((s) => (
            <div
              key={s.id}
              className="rounded-lg border border-slate-100 p-3 space-y-2 bg-input"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{s.originalName}</div>
                  <div className="text-xs ">
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
            <div className="text-sm ">No baseline specs yet.</div>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
