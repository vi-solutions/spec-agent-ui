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

export const VARIANCE_REPORT_SCHEMA_VERSION = "variance-report.v1" as const;

export type VarianceReportV1 = {
  schemaVersion: typeof VARIANCE_REPORT_SCHEMA_VERSION;
  reportId: string;
  createdAt: string;

  inputs: {
    clientSpec: { specFileId: string; title: string };
    baselineSpec: { specFileId: string; title: string };
    model: { name: string; temperature?: number };
  };

  summary: {
    overallRisk: "low" | "medium" | "high";
    totals: {
      matches: number;
      deviations: number;
      clientStricter: number;
      baselineStricter: number;
      missingInClient: number;
      missingInBaseline: number;
      unknown: number;
    };
    keyFindings: string;
  };

  items: VarianceItemV1[];
};

export type VarianceItemV1 = {
  id: string;
  category:
    | "materials"
    | "design"
    | "fabrication"
    | "welding"
    | "nde"
    | "heat_treatment"
    | "testing"
    | "documentation"
    | "marking"
    | "general"
    | "other";

  topic: string;
  status:
    | "match"
    | "deviation"
    | "client_stricter"
    | "baseline_stricter"
    | "missing_in_client"
    | "missing_in_baseline"
    | "unknown";

  severity: "info" | "low" | "medium" | "high";
  decisionNeeded: boolean;

  client: SpecStatementV1 | null;
  baseline: SpecStatementV1 | null;

  delta: {
    description: string;
    recommendedAction?: string;
    questions?: string[];
  };

  evidence: {
    clientCitations: CitationV1[];
    baselineCitations: CitationV1[];
  };
};

export type SpecStatementV1 = {
  statement: string;
};

export type CitationV1 = {
  sourceTitle: string;
  excerpt: string;
  locator?: string;
};

export type ComparisonStatus = "completed" | "failed";

export type SpecComparisonParseErrorReason =
  | "no_model_text"
  | "invalid_json"
  | "unexpected_schema_version";

export type SpecComparisonParseErrorReport = {
  parseError: true;
  reason: SpecComparisonParseErrorReason;
  modelText: string;
  rawSummary: unknown;
  projectId: string;
  usedSpecFileIds: string[];
};

export type SpecComparisonReport =
  | SpecComparisonParseErrorReport
  | VarianceReportV1;

export interface SpecComparisonRow {
  id: string;
  project_id: string;
  report: SpecComparisonReport;
  model_name: string;
  prompt_version: string | null;
  status: ComparisonStatus;
  error: string | null;
  created_at: string;
}

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

    async getProject(projectId: string): Promise<Project> {
      const res = await authedFetch(`${API_BASE}/projects/${projectId}`, {
        cache: "no-store",
      });
      return parseJsonOrThrow(res, "Failed to get project");
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

    async listComparisons(projectId: string): Promise<SpecComparisonRow[]> {
      const res = await authedFetch(
        `${API_BASE}/comparisons/project/${encodeURIComponent(projectId)}`,
        { cache: "no-store" }
      );
      return parseJsonOrThrow(res, "Failed to list comparisons");
    },

    async runComparison(projectId: string): Promise<SpecComparisonRow> {
      const res = await authedFetch(
        `${API_BASE}/comparisons/project/${encodeURIComponent(projectId)}`,
        {
          method: "POST",
        }
      );
      return parseJsonOrThrow(res, "Failed to run comparison");
    },

    async getComparison(comparisonId: string): Promise<SpecComparisonRow> {
      const res = await authedFetch(`${API_BASE}/comparisons/${comparisonId}`, {
        cache: "no-store",
      });
      return parseJsonOrThrow(res, "Failed to get comparison");
    },

    async getVarianceReport(comparisonId: string): Promise<VarianceReportV1> {
      const res = await authedFetch(
        `${API_BASE}/comparisons/${comparisonId}/report`,
        { cache: "no-store" }
      );
      return parseJsonOrThrow(res, "Failed to get comparison report");
    },
  };
}
