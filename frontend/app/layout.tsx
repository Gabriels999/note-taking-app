import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Note Taking App",
  description: "A full-stack note taking app built with Django and Next.js",
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
