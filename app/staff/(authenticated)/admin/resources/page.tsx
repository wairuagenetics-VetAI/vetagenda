"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Loader2,
  DoorOpen,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useStaffOrg } from "@/lib/hooks/useStaffOrg";
import { RESOURCE_TYPES } from "@/lib/constants";
import { toast } from "sonner";

interface Resource {
  id: string;
  name: string;
  type: string;
  slot_minutes: number;
  is_active_default: boolean;
  color: string;
  sort_order: number;
  center_id: string;
}

export default function ResourcesPage() {
  const { organizationId, loading: orgLoading } = useStaffOrg();
  const [centers, setCenters] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado del diálogo de creación/edición
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("consult_room");
  const [formSlotMinutes, setFormSlotMinutes] = useState("30");
  const [saving, setSaving] = useState(false);

  // Cargar centros
  useEffect(() => {
    if (!organizationId) return;
    const supabase = createClient();
    supabase
      .from("centers")
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setCenters(data || []);
        if (data && data.length > 0 && !selectedCenter) {
          setSelectedCenter(data[0].id);
        }
      });
  }, [organizationId, selectedCenter]);

  // Cargar recursos del centro seleccionado
  const fetchResources = useCallback(async () => {
    if (!selectedCenter) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("resources")
      .select("*")
      .eq("center_id", selectedCenter)
      .order("sort_order");

    setResources((data as Resource[]) || []);
    setLoading(false);
  }, [selectedCenter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Toggle activo/inactivo
  async function toggleActive(resource: Resource) {
    const supabase = createClient();
    const { error } = await supabase
      .from("resources")
      .update({ is_active_default: !resource.is_active_default })
      .eq("id", resource.id);

    if (error) {
      toast.error("Error al actualizar");
    } else {
      fetchResources();
    }
  }

  // Guardar recurso (crear o editar)
  async function handleSave() {
    if (!formName.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const payload = {
      name: formName.trim(),
      type: formType,
      slot_minutes: parseInt(formSlotMinutes),
      center_id: selectedCenter,
    };

    if (editingResource) {
      const { error } = await supabase
        .from("resources")
        .update(payload)
        .eq("id", editingResource.id);
      if (error) toast.error("Error al actualizar");
      else toast.success("Recurso actualizado");
    } else {
      const { error } = await supabase.from("resources").insert(payload);
      if (error) toast.error("Error al crear");
      else toast.success("Recurso creado");
    }

    setSaving(false);
    setDialogOpen(false);
    setEditingResource(null);
    setFormName("");
    fetchResources();
  }

  function openCreate() {
    setEditingResource(null);
    setFormName("");
    setFormType("consult_room");
    setFormSlotMinutes("30");
    setDialogOpen(true);
  }

  function openEdit(r: Resource) {
    setEditingResource(r);
    setFormName(r.name);
    setFormType(r.type);
    setFormSlotMinutes(r.slot_minutes.toString());
    setDialogOpen(true);
  }

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Consultas y Quirófanos</h1>
        <Button size="sm" onClick={openCreate} className="gap-1.5 rounded-lg">
          <Plus className="w-4 h-4" />
          Añadir
        </Button>
      </div>

      {/* Selector de centro */}
      {centers.length > 1 && (
        <Select value={selectedCenter} onValueChange={setSelectedCenter}>
          <SelectTrigger className="w-auto min-w-[180px] rounded-lg">
            <SelectValue placeholder="Selecciona centro" />
          </SelectTrigger>
          <SelectContent>
            {centers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Lista de recursos */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : resources.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No hay recursos configurados en este centro.
        </p>
      ) : (
        <div className="space-y-2">
          {resources.map((r) => {
            const typeLabel =
              RESOURCE_TYPES.find((t) => t.value === r.type)?.label || r.type;

            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {typeLabel} · {r.slot_minutes} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={r.is_active_default}
                    onCheckedChange={() => toggleActive(r)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(r)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Diálogo crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingResource ? "Editar recurso" : "Nuevo recurso"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Consulta 1"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Duración del slot (minutos)</Label>
              <Select value={formSlotMinutes} onValueChange={setFormSlotMinutes}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editingResource ? "Guardar cambios" : "Crear recurso"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
