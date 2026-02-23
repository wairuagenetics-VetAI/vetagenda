import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ThemeProvider } from "@/components/shared/ThemeProvider";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!org) return { title: "Clínica no encontrada" };

  return {
    title: `${org.name} - VetAgenda`,
    description: org.description || `Reserva tu cita en ${org.name}`,
  };
}

export default async function ClinicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!org) notFound();

  return (
    <ThemeProvider brandColor={org.brand_color ?? undefined} accentColor={org.accent_color ?? undefined}>
      <div className="min-h-screen bg-secondary">
        {/* Banner de urgencias si existe */}
        {org.emergency_message && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-center text-sm text-destructive font-medium">
            {org.emergency_message}
          </div>
        )}
        {children}
      </div>
    </ThemeProvider>
  );
}
