"use client";

import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useStaffOrg } from "@/lib/hooks/useStaffOrg";
import { toast } from "sonner";

export default function BrandingPage() {
  const { organizationId, loading: orgLoading } = useStaffOrg();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandColor, setBrandColor] = useState("#0F2B46");
  const [accentColor, setAccentColor] = useState("#4DA8DA");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    if (!organizationId) return;

    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", organizationId)
        .single();

      if (data) {
        setName(data.name || "");
        setDescription(data.description || "");
        setBrandColor(data.brand_color || "#0F2B46");
        setAccentColor(data.accent_color || "#4DA8DA");
        setContactPhone(data.contact_phone || "");
        setContactEmail(data.contact_email || "");
        setEmergencyMessage(data.emergency_message || "");
        setLogoUrl(data.logo_url || "");
      }
      setLoading(false);
    }

    load();
  }, [organizationId]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("organizations")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        brand_color: brandColor,
        accent_color: accentColor,
        contact_phone: contactPhone.trim() || null,
        contact_email: contactEmail.trim() || null,
        emergency_message: emergencyMessage.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId);

    if (error) {
      toast.error("Error al guardar");
    } else {
      toast.success("Cambios guardados");
    }
    setSaving(false);
  }

  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-xl font-bold">Personalización</h1>

      {/* Logo */}
      <div className="space-y-2">
        <Label>Logo (512x512px, PNG/SVG)</Label>
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="w-14 h-14 rounded-xl object-contain border border-border"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Sube el logo desde Supabase Storage y pega la URL aquí.
          </p>
        </div>
        <Input
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="URL del logo"
          className="rounded-lg"
        />
      </div>

      {/* Colores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Color principal</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
            />
            <Input
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              className="rounded-lg"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Color de acento</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
            />
            <Input
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Nombre */}
      <div className="space-y-1.5">
        <Label>Nombre de la clínica *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg"
        />
      </div>

      {/* Descripción */}
      <div className="space-y-1.5">
        <Label>Descripción</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descripción de la clínica"
          rows={2}
          className="rounded-lg resize-none"
        />
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Teléfono</Label>
          <Input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="982 XXX XXX"
            className="rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="info@clinica.com"
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Mensaje urgencias */}
      <div className="space-y-1.5">
        <Label>Mensaje de urgencias</Label>
        <Textarea
          value={emergencyMessage}
          onChange={(e) => setEmergencyMessage(e.target.value)}
          placeholder="Para urgencias fuera de horario: 900 123 456"
          rows={2}
          className="rounded-lg resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Se muestra como banner en la página pública.
        </p>
      </div>

      <Button
        onClick={handleSave}
        className="w-full rounded-xl"
        disabled={saving}
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Guardar cambios
      </Button>
    </div>
  );
}
