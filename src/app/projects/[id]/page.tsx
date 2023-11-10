import { ProjectPageContainer } from "./ProjectPageContainer";

export default function ViewProject({ params }: { params: { id: string } }) {
  return <ProjectPageContainer projectId={params.id} />;
}
