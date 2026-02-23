import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StaffShell } from "@/components/staff/StaffShell";

// Layout para las rutas autenticadas del staff
// Carga los datos del profesional logueado y envuelve con StaffShell
export default async function AuthenticatedStaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/staff/login");
  }

  // Obtener datos del profesional y su organización
  const { data: professional } = await supabase
    .from("professionals")
    .select(
      `
      id,
      display_name,
      organization_id,
      organizations!inner(name)
    `
    )
    .eq("user_id", user.id)
    .single();

  const staffName = professional?.display_name || user.email || "Staff";
  const orgName =
    (professional?.organizations as unknown as { name: string })?.name ||
    "VetAgenda";

  return (
    <StaffShell staffName={staffName} orgName={orgName}>
      {children}
    </StaffShell>
  );
}
