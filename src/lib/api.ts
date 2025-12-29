const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL");
}

export type Project = { id: string; name: string; code?: string | null };
export type SpecFile = {
  id: string;
  projectId: string;
  originalName: string;
  ingestionStatus: "pending" | "indexed" | "failed";
  ingestionError?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to list projects: ${res.status}`);
  return res.json();
}

export async function createProject(params: {
  name: string;
  code?: string;
}): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Failed to create project: ${res.status}`);
  return res.json();
}

export async function listSpecs(projectId: string): Promise<SpecFile[]> {
  const res = await fetch(
    `${API_BASE}/specs?projectId=${encodeURIComponent(projectId)}`,
    {
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`Failed to list specs: ${res.status}`);
  return res.json();
}

export async function uploadSpec(params: { projectId: string; file: File }) {
  const form = new FormData();
  form.append("file", params.file);
  form.append("projectId", params.projectId);

  const res = await fetch(`${API_BASE}/specs/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Failed to upload spec: ${res.status}`);
  return res.json();
}
