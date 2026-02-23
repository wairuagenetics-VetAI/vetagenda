"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useStaffOrg } from "@/lib/hooks/useStaffOrg";
import { toast } from "sonner";

interface Center {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  is_active: boolean;
}

export default function CentersPage() {
  const { organizationId, loading: orgLoading } = useStaffOrg();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Center | null>(null);
  const [saving, setSaving] = useState(false);

  const [centerName, setCenterName] = useState("");
  const [centerSlug, setCenterSlug] = useState("");
  const [centerAddress, setCenterAddress] = useState("");
  const [centerPhone, setCenterPhone] = useState("");

  const fetchCenters = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("centers")
      .select("*")
      .eq("organization_id", organizationId)
      .order("name");
    setCenters((data as Center[]) || []);
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  function openCreate() {
    setEditing(null);
    setCenterName("");
    setCenterSlug("");
    setCenterAddress("");
    setCenterPhone("");
    setDialogOpen(true);
  }

  function openEdit(c: Center) {
    setEditing(c);
    setCenterName(c.name);
    setCenterSlug(c.slug);
    setCenterAddress(c.address || "");
    setCenterPhone(c.phone || "");
    setDialogOpen(true);
  }

  // Auto-generar slug a partir del nombre
  function handleNameChange(name: string) {
    setCenterName(name);
    if (!editing) {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setCenterSlug(slug);
    }
  }

  async function handleSave() {
    if (!centerName.trim() || !centerSlug.trim()) {
      toast.error("Nombre y slug son obligatorios");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const payload = {
      name: centerName.trim(),
      slug: centerSlug.trim(),
      address: centerAddress.trim() || null,
      phone: centerPhone.trim() || null,
      organization_id: organizationId,
    };

    if (editing) {
      const { error } = await supabase
        .from("centers")
        .update(payload)
        .eq("id", editing.id);
      if (error) toast.error("Error al actualizar");
      else toast.success("Centro actualizado");
    } else {
      const { error } = await supabase.from("centers").insert(payload);
      if (error) toast.error("Error al crear centro");
      else toast.success("Centro creado");
    }

    setSaving(false);
    setDialogOpen(false);
    fetchCenters();
  }

  async function toggleActive(c: Center) {
    const supabase = createClient();
    await supabase
      .from("centers")
      .update({ is_active: !c.is_active })
      .eq("id", c.id);
    fetchCenters();
  }

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Centros</h1>
        <Button size="sm" onClick={openCreate} className="gap-1.5 rounded-lg">
          <Plus className="w-4 h-4" />
          Añadir
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : centers.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No hay centros configurados.
        </p>
      ) : (
        <div className="space-y-2">
          {centers.map((c) => (
            <div
              key={c.id}
              className={`flex items-center justify-between rounded-xl border border-border bg-card p-4 ${
                !c.is_active ? "opacity-50" : ""
              }`}
            >
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  /{c.slug}
                  {c.address && ` · ${c.address}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={c.is_active}
                  onCheckedChange={() => toggleActive(c)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar centro" : "Nuevo centro"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                value={centerName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ej: Centro Burela"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input
                value={centerSlug}
                onChange={(e) => setCenterSlug(e.target.value)}
                placeholder="centro-burela"
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                Identificador único dentro de la organización
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Dirección</Label>
              <Input
                value={centerAddress}
                onChange={(e) => setCenterAddress(e.target.value)}
                placeholder="Calle Example, 1"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input
                value={centerPhone}
                onChange={(e) => setCenterPhone(e.target.value)}
                placeholder="982 XXX XXX"
                className="rounded-lg"
              />
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? "Guardar cambios" : "Crear centro"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
