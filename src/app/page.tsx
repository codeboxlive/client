import { Metadata } from "next";
import dynamic from "next/dynamic";


export const metadata: Metadata = {
  title: "Codebox Live",
  description: "Collaborative code sandbox for building Teams apps",
};

// Dynamically import the component that uses the navigator object
const RootPageContainer = dynamic(
  import("./RootPageContainer").then((mod) => mod.RootPageContainer),
  {
    ssr: false, // Disable server-side rendering
  }
);

export default function ProjectsHome() {
  return <RootPageContainer />;
}
