import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UoL Assignment Generator",
  description:
    "Generate University of Lahore assignment documents with AI and download as DOCX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
