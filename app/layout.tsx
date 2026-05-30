import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Cup 2026",
  description: "USA · Canada · Mexico · Jun 11 – Jul 19, 2026",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#07090f" }}>{children}</body>
    </html>
  );
}
