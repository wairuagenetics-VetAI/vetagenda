import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel Staff - VetAgenda",
  description: "Panel de gestión para clínicas veterinarias",
};

export default function StaffRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
