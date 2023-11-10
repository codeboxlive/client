import dynamic from "next/dynamic";

// Dynamically import the component that uses the navigator object
const ProjectPageContainer = dynamic(
  import("./ProjectPageContainer").then((mod) => mod.ProjectPageContainer),
  {
    ssr: false, // Disable server-side rendering
  }
);

export default function ViewProject({ params }: { params: { id: string } }) {
  return <ProjectPageContainer projectId={params.id} />;
}
