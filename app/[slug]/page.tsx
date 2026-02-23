import Link from "next/link";
import { Phone, MapPin, Mail, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function ClinicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!org) notFound();

  const { data: centers } = await supabase
    .from("centers")
    .select("*")
    .eq("organization_id", org.id)
    .eq("is_active", true)
    .order("name");

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Header con logo y nombre */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <Logo src={org.logo_url} alt={org.name} size={56} />
        </div>
        <h1 className="text-2xl font-bold">{org.name}</h1>
        {org.description && (
          <p className="text-muted-foreground">{org.description}</p>
        )}
      </div>

      {/* Imagen de portada */}
      {org.cover_image_url && (
        <div className="rounded-2xl overflow-hidden">
          <img
            src={org.cover_image_url}
            alt={`Portada de ${org.name}`}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Boton principal de reserva */}
      <Link href={`/${slug}/book`} className="block">
        <Button size="lg" className="w-full text-lg py-6 rounded-xl gap-2">
          <CalendarPlus className="w-5 h-5" />
          Reservar Cita
        </Button>
      </Link>

      {/* Info de contacto */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {org.contact_phone && (
          <a href={`tel:${org.contact_phone}`} className="flex items-center gap-3 text-sm hover:text-accent transition-colors">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{org.contact_phone}</span>
          </a>
        )}
        {org.contact_email && (
          <a href={`mailto:${org.contact_email}`} className="flex items-center gap-3 text-sm hover:text-accent transition-colors">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{org.contact_email}</span>
          </a>
        )}
        {centers && centers.length > 0 && centers.map((center) => (
          <div key={center.id} className="flex items-start gap-3 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">{center.name}</p>
              {center.address && <p className="text-muted-foreground">{center.address}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Footer con link de privacidad */}
      {org.privacy_policy_url && (
        <p className="text-center text-xs text-muted-foreground">
          <a href={org.privacy_policy_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
            Politica de privacidad
          </a>
        </p>
      )}
    </main>
  );
}
