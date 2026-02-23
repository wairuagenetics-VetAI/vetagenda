import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DayAgenda } from "@/components/staff/DayAgenda";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/staff/login");

  // Obtener organización del usuario
  const { data: professional } = await supabase
    .from("professionals")
    .select("id, organization_id")
    .eq("user_id", user.id)
    .single();

  if (!professional) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Tu cuenta no está vinculada a ninguna clínica.</p>
        <p className="text-sm mt-1">Contacta con el administrador.</p>
      </div>
    );
  }

  // Cargar centros de la organización
  const { data: centers } = await supabase
    .from("centers")
    .select("id, name")
    .eq("organization_id", professional.organization_id)
    .eq("is_active", true)
    .order("name");

  // Cargar profesionales de la organización
  const { data: professionals } = await supabase
    .from("professionals")
    .select("id, display_name, color")
    .eq("organization_id", professional.organization_id)
    .eq("is_active", true)
    .order("display_name");

  return (
    <DayAgenda
      organizationId={professional.organization_id}
      centers={centers || []}
      professionals={professionals || []}
      currentProfessionalId={professional.id}
    />
  );
}
