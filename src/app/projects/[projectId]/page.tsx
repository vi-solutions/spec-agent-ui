import ProjectSpecsView from "@/components/ProjectSpecsView";

export default async function ProjectPage(props: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await props.params;

  return (
    <main className="mx-auto max-w-4xl p-6">
      <ProjectSpecsView projectId={projectId} />
    </main>
  );
}
