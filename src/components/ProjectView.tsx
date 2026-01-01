"use client";

import Link from "next/link";
import ProjectSpecsView from "@components/ProjectSpecsView";
import ProjectComparisonsView from "@components/ProjectComparisonsView";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { Project } from "@/lib/api";

export default function ProjectView(props: { projectId: string }) {
  const { projectId } = props;
  const { isAuthenticated, isLoading } = useAuth0();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    let cancelled = false;

    if (isLoading || !isAuthenticated) {
      return;
    }

    async function load() {
      setError(null);

      try {
        const data = await api.getProject(projectId);
        if (!cancelled) {
          setProject(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [projectId, api, isAuthenticated, isLoading]);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">
            Project {project && project.name}
          </h2>
          {error && <div className="text-sm text-red-500">{error}</div>}
        </div>

        <Link href="/" className="text-sm no-print">
          ← Back
        </Link>
      </div>
      <ProjectSpecsView projectId={projectId} />
      <ProjectComparisonsView projectId={projectId} />
    </section>
  );
}
