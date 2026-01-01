"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import { Card } from "@components/ui/Card";
import { useApi } from "@/hooks/use-api";
import {
  type CitationV1,
  type SpecStatementV1,
  type VarianceItemV1,
  type VarianceReportV1,
} from "@/lib/api";

type Status = "idle" | "loading" | "error";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

function formatBool(b: boolean) {
  return b ? "Yes" : "No";
}

function severityBadgeTextClass(severity: VarianceItemV1["severity"]) {
  switch (severity) {
    case "high":
      return "text-red-600";
    case "medium":
      return "text-amber-600";
    case "low":
      return "text-slate-500";
    case "info":
      return "text-slate-400";
    default:
      return "text-slate-400";
  }
}

function StatementBlock(props: {
  label: string;
  statement: SpecStatementV1 | null;
}) {
  const { label, statement } = props;

  return (
    <div className="space-y-1">
      <div className="text-sm text-slate-400">{label}</div>
      {statement ? (
        <div className="space-y-1">
          <div className="text-sm">{statement.statement}</div>
        </div>
      ) : (
        <div className="text-sm text-slate-400">—</div>
      )}
    </div>
  );
}

function CitationList(props: { label: string; citations: CitationV1[] }) {
  const { label, citations } = props;
  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <details className="rounded-lg border border-slate-100 bg-input px-3 py-2 print-avoid-break">
      <summary className="cursor-pointer text-sm">
        {label} citations ({citations.length})
      </summary>
      <div className="mt-2 space-y-3">
        {citations.map((c, idx) => (
          <div key={idx} className="space-y-1">
            <div className="text-sm font-medium">
              {c.sourceTitle}
              {c.locator ? (
                <span className="text-slate-400"> • {c.locator}</span>
              ) : null}
            </div>
            <div className="text-sm text-amber-600 whitespace-pre-wrap">
              {c.excerpt}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}

function SectionTitle(props: { children: string }) {
  return <div className="text-lg font-semibold">{props.children}</div>;
}

function StatTile(props: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-input px-3 py-2">
      <div className="text-sm text-slate-400">{props.label}</div>
      <div className="text-lg font-semibold">{props.value}</div>
    </div>
  );
}

function KeyFindingsList(props: { findings: string | null | undefined }) {
  const { findings } = props;

  if (!findings) {
    return <div className="text-sm text-slate-400">No key findings.</div>;
  }

  return <div className="text-sm whitespace-pre-wrap">{findings}</div>;
}

function mapRiskToTextClass(risk: string) {
  switch (risk) {
    case "low":
      return "text-green-600";
    case "medium":
      return "text-amber-600";
    case "high":
      return "text-red-600";
    default:
      return "text-slate-400";
  }
}

function SummarySection(props: { report: VarianceReportV1 }) {
  const { summary } = props.report;

  return (
    <div className="space-y-3">
      <SectionTitle>Summary</SectionTitle>
      <div className="text-sm">
        Overall risk:{" "}
        <span
          className={`uppercase ${mapRiskToTextClass(summary.overallRisk)}`}
        >
          {summary.overallRisk}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Matches" value={summary.totals.matches} />
        <StatTile label="Deviations" value={summary.totals.deviations} />
        <StatTile
          label="Client stricter"
          value={summary.totals.clientStricter}
        />
        <StatTile
          label="Baseline stricter"
          value={summary.totals.baselineStricter}
        />
        <StatTile
          label="Missing in client"
          value={summary.totals.missingInClient}
        />
        <StatTile
          label="Missing in baseline"
          value={summary.totals.missingInBaseline}
        />
        <StatTile label="Unknown" value={summary.totals.unknown} />
      </div>

      <div className="space-y-2">
        <SectionTitle>Key findings</SectionTitle>
        <KeyFindingsList findings={summary.keyFindings} />
      </div>
    </div>
  );
}

function InputsSection(props: { report: VarianceReportV1 }) {
  const { inputs } = props.report;

  return (
    <div className="space-y-3">
      <SectionTitle>Inputs</SectionTitle>
      <div className="grid gap-2 md:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-input px-3 py-2">
          <div className="text-sm text-slate-400">Client spec</div>
          <div className="text-sm font-medium">{inputs.clientSpec.title}</div>
          <div className="text-sm text-slate-400">
            {inputs.clientSpec.specFileId}
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-input px-3 py-2">
          <div className="text-sm text-slate-400">Baseline spec</div>
          <div className="text-sm font-medium">{inputs.baselineSpec.title}</div>
          <div className="text-sm text-slate-400">
            {inputs.baselineSpec.specFileId}
          </div>
        </div>
        <div className="rounded-lg border border-slate-100 bg-input px-3 py-2">
          <div className="text-sm text-slate-400">Model</div>
          <div className="text-sm font-medium">{inputs.model.name}</div>
          {inputs.model.temperature != null ? (
            <div className="text-sm text-slate-400">
              Temperature: {inputs.model.temperature}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DeltaSection(props: { delta: VarianceItemV1["delta"] }) {
  const { delta } = props;

  return (
    <div className="space-y-1">
      <div className="text-sm text-slate-400">Delta</div>
      <div className="text-sm whitespace-pre-wrap">{delta.description}</div>
      {delta.recommendedAction ? (
        <div className="text-sm text-amber-600 whitespace-pre-wrap">
          Recommended action: {delta.recommendedAction}
        </div>
      ) : null}
      {delta.questions?.length ? (
        <div className="text-sm text-amber-600">
          Questions:
          <ul className="list-disc pl-5 mt-1 space-y-1">
            {delta.questions.map((q, idx) => (
              <li key={idx}>{q}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function EvidenceSection(props: { item: VarianceItemV1 }) {
  const { item } = props;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <CitationList label="Client" citations={item.evidence?.clientCitations} />
      <CitationList
        label="Baseline"
        citations={item.evidence?.baselineCitations}
      />
    </div>
  );
}

function VarianceItemCard(props: { item: VarianceItemV1 }) {
  const { item } = props;

  return (
    <div className="rounded-lg border border-slate-100 bg-input px-4 py-3 space-y-3 print-avoid-break">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{item.topic}</div>
          <div className="text-sm text-slate-400">
            {item.category} • {item.status} • severity: {item.severity}
            {item.decisionNeeded ? " • decision needed" : ""}
          </div>
        </div>

        <div className="text-right">
          <span>Severity: </span>
          <span
            className={
              "rounded-full border text-right border-slate-300 px-2 py-0.5 text-xs font-semibold uppercase " +
              severityBadgeTextClass(item.severity)
            }
          >
            {item.severity}
          </span>
          <div className="text-sm text-slate-400">
            Decision needed: <span>{formatBool(item.decisionNeeded)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatementBlock label="Client" statement={item.client} />
        <StatementBlock label="Baseline" statement={item.baseline} />
      </div>

      <DeltaSection delta={item.delta} />

      <EvidenceSection item={item} />
    </div>
  );
}

function ItemsSection(props: { items: VarianceReportV1["items"] }) {
  const { items } = props;

  function severityRank(sev: VarianceItemV1["severity"]) {
    switch (sev) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      case "info":
        return 0;
      default:
        return -1;
    }
  }

  const sortedItems = [...items].sort((a, b) => {
    const bySeverity = severityRank(b.severity) - severityRank(a.severity);
    if (bySeverity !== 0) return bySeverity;

    const byTopic = a.topic.localeCompare(b.topic);
    if (byTopic !== 0) return byTopic;

    return a.id.localeCompare(b.id);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <SectionTitle>Items</SectionTitle>
        <div className="text-sm text-slate-400">{items.length} total</div>
      </div>

      <div className="space-y-3">
        {sortedItems.map((item) => (
          <VarianceItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function ReportBody(props: { report: VarianceReportV1 }) {
  const { report } = props;

  return (
    <div className="space-y-6">
      <SummarySection report={report} />
      <InputsSection report={report} />
      <ItemsSection items={report.items} />
    </div>
  );
}

export default function VarianceReportView(props: {
  projectId: string;
  comparisonId: string;
}) {
  const { projectId, comparisonId } = props;

  const [report, setReport] = useState<VarianceReportV1 | null>(null);
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
        const data = await api.getVarianceReport(comparisonId);
        if (!cancelled) {
          setReport(data);
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
  }, [api, comparisonId, isAuthenticated, isLoading]);

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Comparison report</h2>
          <div className="text-sm text-slate-400">ID: {comparisonId}</div>
        </div>

        <Link
          href={`/projects/${encodeURIComponent(projectId)}`}
          className="text-sm no-print"
        >
          ← Back
        </Link>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <Card className="border-0">
        {status === "loading" ? (
          <div className="text-sm text-slate-400">Loading…</div>
        ) : report ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-semibold">
                  Report Version: {report.schemaVersion}
                </div>
                <div className="text-sm text-slate-400">
                  {formatDateTime(report.createdAt)}
                </div>
              </div>
            </div>

            <ReportBody report={report} />
          </div>
        ) : (
          <div className="text-sm text-slate-400">No report found.</div>
        )}
      </Card>
    </section>
  );
}
