import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ServicePicker } from "@/components/public/ServicePicker";

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!org) notFound();

  // Cargar servicios activos de la organizacion
  const { data: services } = await supabase
    .from("services")
    .select("id, name_public, description, icon, duration_minutes, allows_choose_professional")
    .eq("organization_id", org.id)
    .eq("is_active", true)
    .order("sort_order");

  // Cargar centros activos
  const { data: centers } = await supabase
    .from("centers")
    .select("id, name, slug")
    .eq("organization_id", org.id)
    .eq("is_active", true)
    .order("name");

  return (
    <ServicePicker
      slug={slug}
      services={services || []}
      centers={centers || []}
    />
  );
}
