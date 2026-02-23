"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Pencil, Trash2, GripVertical } from "lucide-react";
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

interface ReasonCategory {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export default function ReasonsPage() {
  const { organizationId, loading: orgLoading } = useStaffOrg();
  const [reasons, setReasons] = useState<ReasonCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ReasonCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [reasonName, setReasonName] = useState("");

  const fetchReasons = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("reason_categories")
      .select("*")
      .eq("organization_id", organizationId)
      .order("sort_order");
    setReasons((data as ReasonCategory[]) || []);
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    fetchReasons();
  }, [fetchReasons]);

  function openCreate() {
    setEditing(null);
    setReasonName("");
    setDialogOpen(true);
  }

  function openEdit(r: ReasonCategory) {
    setEditing(r);
    setReasonName(r.name);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!reasonName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    if (editing) {
      const { error } = await supabase
        .from("reason_categories")
        .update({ name: reasonName.trim() })
        .eq("id", editing.id);
      if (error) toast.error("Error al actualizar");
      else toast.success("Motivo actualizado");
    } else {
      const { error } = await supabase.from("reason_categories").insert({
        name: reasonName.trim(),
        organization_id: organizationId,
        sort_order: reasons.length + 1,
      });
      if (error) toast.error("Error al crear");
      else toast.success("Motivo creado");
    }

    setSaving(false);
    setDialogOpen(false);
    fetchReasons();
  }

  async function toggleActive(r: ReasonCategory) {
    const supabase = createClient();
    await supabase
      .from("reason_categories")
      .update({ is_active: !r.is_active })
      .eq("id", r.id);
    fetchReasons();
  }

  async function deleteReason(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("reason_categories")
      .delete()
      .eq("id", id);
    if (error) toast.error("Error al eliminar");
    else fetchReasons();
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
        <h1 className="text-xl font-bold">Motivos de consulta</h1>
        <Button size="sm" onClick={openCreate} className="gap-1.5 rounded-lg">
          <Plus className="w-4 h-4" />
          Añadir
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : reasons.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No hay motivos configurados.
        </p>
      ) : (
        <div className="space-y-2">
          {reasons.map((r) => (
            <div
              key={r.id}
              className={`flex items-center justify-between rounded-xl border border-border bg-card p-3 ${
                !r.is_active ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{r.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Switch
                  checked={r.is_active}
                  onCheckedChange={() => toggleActive(r)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(r)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteReason(r.id)}
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
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
              {editing ? "Editar motivo" : "Nuevo motivo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                value={reasonName}
                onChange={(e) => setReasonName(e.target.value)}
                placeholder="Ej: Problema digestivo"
                className="rounded-lg"
              />
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? "Guardar cambios" : "Crear motivo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
