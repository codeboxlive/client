import "./globals.css";
import { RootLayoutContainer } from "./RootLayoutContainer";

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
