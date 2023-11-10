import dynamic from "next/dynamic";
// Dynamically import the component that uses the navigator object
const RootLayoutContainer = dynamic(
  import("./RootLayoutContainer").then((mod) => mod.RootLayoutContainer),
  {
    ssr: false, // Disable server-side rendering
  }
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RootLayoutContainer>{children}</RootLayoutContainer>
      </body>
    </html>
  );
}
