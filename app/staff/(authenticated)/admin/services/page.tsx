"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { RESOURCE_TYPES, SERVICE_ICONS } from "@/lib/constants";
import { toast } from "sonner";

interface Service {
  id: string;
  name_public: string;
  name_internal: string | null;
  description: string | null;
  icon: string;
  duration_minutes: number;
  resource_type_required: string;
  allows_choose_professional: boolean;
  requires_manual_confirmation: boolean;
  is_active: boolean;
  sort_order: number;
}

export default function ServicesPage() {
  const { organizationId, loading: orgLoading } = useStaffOrg();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [saving, setSaving] = useState(false);

  // Formulario
  const [namePublic, setNamePublic] = useState("");
  const [nameInternal, setNameInternal] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("stethoscope");
  const [duration, setDuration] = useState("30");
  const [resourceType, setResourceType] = useState("consult_room");
  const [allowsChoose, setAllowsChoose] = useState(true);
  const [requiresConfirm, setRequiresConfirm] = useState(false);

  const fetchServices = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("organization_id", organizationId)
      .order("sort_order");
    setServices((data as Service[]) || []);
    setLoading(false);
  }, [organizationId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  function openCreate() {
    setEditing(null);
    setNamePublic("");
    setNameInternal("");
    setDescription("");
    setIcon("stethoscope");
    setDuration("30");
    setResourceType("consult_room");
    setAllowsChoose(true);
    setRequiresConfirm(false);
    setDialogOpen(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setNamePublic(s.name_public);
    setNameInternal(s.name_internal || "");
    setDescription(s.description || "");
    setIcon(s.icon);
    setDuration(s.duration_minutes.toString());
    setResourceType(s.resource_type_required);
    setAllowsChoose(s.allows_choose_professional);
    setRequiresConfirm(s.requires_manual_confirmation);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!namePublic.trim()) {
      toast.error("El nombre público es obligatorio");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const payload = {
      name_public: namePublic.trim(),
      name_internal: nameInternal.trim() || null,
      description: description.trim() || null,
      icon,
      duration_minutes: parseInt(duration),
      resource_type_required: resourceType,
      allows_choose_professional: allowsChoose,
      requires_manual_confirmation: requiresConfirm,
      organization_id: organizationId,
    };

    if (editing) {
      const { error } = await supabase
        .from("services")
        .update(payload)
        .eq("id", editing.id);
      if (error) toast.error("Error al actualizar");
      else toast.success("Servicio actualizado");
    } else {
      const { error } = await supabase.from("services").insert(payload);
      if (error) toast.error("Error al crear");
      else toast.success("Servicio creado");
    }

    setSaving(false);
    setDialogOpen(false);
    fetchServices();
  }

  async function toggleActive(s: Service) {
    const supabase = createClient();
    await supabase
      .from("services")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    fetchServices();
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
        <h1 className="text-xl font-bold">Servicios</h1>
        <Button size="sm" onClick={openCreate} className="gap-1.5 rounded-lg">
          <Plus className="w-4 h-4" />
          Añadir
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : services.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No hay servicios configurados.
        </p>
      ) : (
        <div className="space-y-2">
          {services.map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between rounded-xl border border-border bg-card p-4 ${
                !s.is_active ? "opacity-50" : ""
              }`}
            >
              <div>
                <p className="font-medium">{s.name_public}</p>
                <p className="text-xs text-muted-foreground">
                  {s.duration_minutes} min ·{" "}
                  {RESOURCE_TYPES.find((t) => t.value === s.resource_type_required)?.label}
                  {s.requires_manual_confirmation && " · Requiere confirmación"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={s.is_active}
                  onCheckedChange={() => toggleActive(s)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(s)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diálogo crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar servicio" : "Nuevo servicio"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre público *</Label>
              <Input
                value={namePublic}
                onChange={(e) => setNamePublic(e.target.value)}
                placeholder="Ej: Vacunación"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Nombre interno (opcional)</Label>
              <Input
                value={nameInternal}
                onChange={(e) => setNameInternal(e.target.value)}
                placeholder="Ej: Vacuna estándar perro/gato"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descripción (opcional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción para el cliente"
                rows={2}
                className="rounded-lg resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Icono</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SERVICE_ICONS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Duración</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de recurso necesario</Label>
              <Select value={resourceType} onValueChange={setResourceType}>
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
            <div className="flex items-center justify-between">
              <Label>El cliente puede elegir veterinario</Label>
              <Switch checked={allowsChoose} onCheckedChange={setAllowsChoose} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Requiere confirmación manual</Label>
              <Switch
                checked={requiresConfirm}
                onCheckedChange={setRequiresConfirm}
              />
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {editing ? "Guardar cambios" : "Crear servicio"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
