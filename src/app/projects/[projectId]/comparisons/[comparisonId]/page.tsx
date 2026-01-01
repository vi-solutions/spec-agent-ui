import VarianceReportView from "@/components/VarianceReportView";

export default async function ComparisonReportPage(props: {
  params: Promise<{ projectId: string; comparisonId: string }>;
}) {
  const { projectId, comparisonId } = await props.params;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <VarianceReportView projectId={projectId} comparisonId={comparisonId} />
    </main>
  );
}
