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
  revision: string;
};

type GetToken = () => Promise<string>;

function makeAuthedFetch(getToken: GetToken) {
  return async function authedFetch(
    input: RequestInfo,
    init: RequestInit = {}
  ) {
    const token = await getToken();

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    return fetch(input, { ...init, headers });
  };
}

async function parseJsonOrThrow(res: Response, message: string) {
  if (res.ok) {
    return res.json();
  }

  // Helpful for debugging Nest errors.
  const text = await res.text();
  throw new Error(`${message}: ${res.status} ${text}`);
}

export function createApi(getToken: GetToken) {
  const authedFetch = makeAuthedFetch(getToken);

  return {
    async listProjects(): Promise<Project[]> {
      const res = await authedFetch(`${API_BASE}/projects`, {
        cache: "no-store",
      });
      return parseJsonOrThrow(res, "Failed to list projects");
    },

    async createProject(params: {
      name: string;
      code?: string;
    }): Promise<Project> {
      const res = await authedFetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      return parseJsonOrThrow(res, "Failed to create project");
    },

    async listSpecs(projectId: string): Promise<SpecFile[]> {
      const res = await authedFetch(
        `${API_BASE}/specs?projectId=${encodeURIComponent(projectId)}`,
        { cache: "no-store" }
      );
      return parseJsonOrThrow(res, "Failed to list specs");
    },

    async uploadSpec(params: { projectId: string; file: File }) {
      const form = new FormData();
      form.append("file", params.file);
      form.append("projectId", params.projectId);

      const res = await authedFetch(`${API_BASE}/specs/upload`, {
        method: "POST",
        body: form,
      });
      return parseJsonOrThrow(res, "Failed to upload spec");
    },

    async listBaselineSpecs(): Promise<SpecFile[]> {
      const res = await authedFetch(`${API_BASE}/specs?baseline=true`, {
        cache: "no-store",
      });
      return parseJsonOrThrow(res, "Failed to list baseline specs");
    },

    async uploadBaselineSpec(file: File) {
      const form = new FormData();
      form.append("file", file);

      const res = await authedFetch(`${API_BASE}/specs/upload`, {
        method: "POST",
        body: form,
      });
      return parseJsonOrThrow(res, "Failed to upload baseline spec");
    },
  };
}
