"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useStaffOrg } from "@/lib/hooks/useStaffOrg";
import { PROFESSIONAL_COLORS } from "@/lib/constants";
import { toast } from "sonner";

interface Professional {
  id: string;
  display_name: string;
  role_tag: string;
  color: string;
  is_active: boolean;
}

export default function ProfessionalsPage() {
  const { organizationId, loading: orgLoading } = useStaffOrg();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [roleTag, setRoleTag] = useState("vet");
  const [color, setColor] = useState(PROFESSIONAL_COLORS[0]);

  const fetchProfessionals = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("professionals")
      .select("id, display_name, role_tag, color, is_active")
      .eq("organization_id", organizationId)
      .order("display_name");
    setProfessionals((data as Professional[]) || []);
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  function openCreate() {
    setEditing(null);
    setDisplayName("");
    setRoleTag("vet");
    setColor(PROFESSIONAL_COLORS[professionals.length % PROFESSIONAL_COLORS.length]);
    setDialogOpen(true);
  }

  function openEdit(p: Professional) {
    setEditing(p);
    setDisplayName(p.display_name);
    setRoleTag(p.role_tag);
    setColor(p.color);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!displayName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const payload = {
      display_name: displayName.trim(),
      role_tag: roleTag,
      color,
      organization_id: organizationId,
    };

    if (editing) {
      const { error } = await supabase
        .from("professionals")
        .update(payload)
        .eq("id", editing.id);
      if (error) toast.error("Error al actualizar");
      else toast.success("Profesional actualizado");
    } else {
      const { error } = await supabase.from("professionals").insert(payload);
      if (error) toast.error("Error al crear");
      else toast.success("Profesional creado");
    }

    setSaving(false);
    setDialogOpen(false);
    fetchProfessionals();
  }

  async function toggleActive(p: Professional) {
    const supabase = createClient();
    await supabase
      .from("professionals")
      .update({ is_active: !p.is_active })
      .eq("id", p.id);
    fetchProfessionals();
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
        <h1 className="text-xl font-bold">Profesionales</h1>
        <Button size="sm" onClick={openCreate} className="gap-1.5 rounded-lg">
          <Plus className="w-4 h-4" />
          Añadir
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : professionals.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No hay profesionales configurados.
        </p>
      ) : (
        <div className="space-y-2">
          {professionals.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-xl border border-border bg-card p-4 ${
                !p.is_active ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: p.color }}
                >
                  {p.display_name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium">{p.display_name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {p.role_tag === "vet"
                      ? "Veterinario/a"
                      : p.role_tag === "atv"
                        ? "ATV"
                        : "Admin"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={p.is_active}
                  onCheckedChange={() => toggleActive(p)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(p)}
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
              {editing ? "Editar profesional" : "Nuevo profesional"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej: Dr. García"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select value={roleTag} onValueChange={setRoleTag}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vet">Veterinario/a</SelectItem>
                  <SelectItem value="atv">ATV</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {PROFESSIONAL_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c ? "ring-2 ring-offset-2 ring-accent" : ""
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? "Guardar cambios" : "Crear profesional"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
