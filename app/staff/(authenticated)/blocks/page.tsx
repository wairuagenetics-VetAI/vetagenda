"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { BLOCK_TYPES } from "@/lib/constants";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Block {
  id: string;
  start_ts: string;
  end_ts: string;
  type: string;
  note: string | null;
  center_id: string;
  resources: { name: string } | null;
  professionals: { display_name: string } | null;
}

export default function BlocksPage() {
  const { organizationId, loading: orgLoading } = useStaffOrg();
  const [centers, setCenters] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [resources, setResources] = useState<Array<{ id: string; name: string }>>([]);
  const [professionals, setProfessionals] = useState<
    Array<{ id: string; display_name: string }>
  >([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [blockType, setBlockType] = useState("blocked");
  const [blockResourceId, setBlockResourceId] = useState("");
  const [blockProfId, setBlockProfId] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockNote, setBlockNote] = useState("");

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

  // Cargar recursos y profesionales del centro
  useEffect(() => {
    if (!selectedCenter) return;
    const supabase = createClient();
    supabase
      .from("resources")
      .select("id, name")
      .eq("center_id", selectedCenter)
      .then(({ data }) => setResources(data || []));

    if (organizationId) {
      supabase
        .from("professionals")
        .select("id, display_name")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .then(({ data }) => setProfessionals(data || []));
    }
  }, [selectedCenter, organizationId]);

  const fetchBlocks = useCallback(async () => {
    if (!selectedCenter) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("blocks")
      .select(
        `id, start_ts, end_ts, type, note, center_id,
         resources(name), professionals!blocks_professional_id_fkey(display_name)`
      )
      .eq("center_id", selectedCenter)
      .order("start_ts", { ascending: false })
      .limit(50);
    setBlocks((data as unknown as Block[]) || []);
    setLoading(false);
  }, [selectedCenter]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  async function handleCreate() {
    if (!blockStart || !blockEnd) {
      toast.error("Las fechas son obligatorias");
      return;
    }
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase.from("blocks").insert({
      center_id: selectedCenter,
      resource_id: blockResourceId || null,
      professional_id: blockProfId || null,
      start_ts: blockStart,
      end_ts: blockEnd,
      type: blockType,
      note: blockNote.trim() || null,
    });

    if (error) toast.error("Error al crear bloqueo");
    else toast.success("Bloqueo creado");

    setSaving(false);
    setDialogOpen(false);
    setBlockNote("");
    setBlockResourceId("");
    setBlockProfId("");
    fetchBlocks();
  }

  async function deleteBlock(id: string) {
    const supabase = createClient();
    await supabase.from("blocks").delete().eq("id", id);
    fetchBlocks();
  }

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Bloqueos</h1>
        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1.5 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Crear bloqueo
        </Button>
      </div>

      {centers.length > 1 && (
        <Select value={selectedCenter} onValueChange={setSelectedCenter}>
          <SelectTrigger className="w-auto min-w-[180px] rounded-lg">
            <SelectValue />
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

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : blocks.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No hay bloqueos configurados.
        </p>
      ) : (
        <div className="space-y-2">
          {blocks.map((b) => {
            const typeLabel =
              BLOCK_TYPES.find((t) => t.value === b.type)?.label || b.type;
            return (
              <div
                key={b.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{typeLabel}</Badge>
                    <span className="text-sm font-medium">
                      {format(new Date(b.start_ts), "dd/MM HH:mm")} -{" "}
                      {format(new Date(b.end_ts), "dd/MM HH:mm")}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    {b.resources && <span>{(b.resources as { name: string }).name}</span>}
                    {b.professionals && (
                      <span>
                        {(b.professionals as { display_name: string }).display_name}
                      </span>
                    )}
                    {b.note && <span>{b.note}</span>}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteBlock(b.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Diálogo crear bloqueo */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo bloqueo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={blockType} onValueChange={setBlockType}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Recurso (opcional)</Label>
              <Select
                value={blockResourceId}
                onValueChange={setBlockResourceId}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Todo el centro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todo el centro</SelectItem>
                  {resources.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Profesional (opcional)</Label>
              <Select value={blockProfId} onValueChange={setBlockProfId}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Cualquiera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Cualquiera</SelectItem>
                  {professionals.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Inicio *</Label>
                <Input
                  type="datetime-local"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fin *</Label>
                <Input
                  type="datetime-local"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nota (opcional)</Label>
              <Input
                value={blockNote}
                onChange={(e) => setBlockNote(e.target.value)}
                placeholder="Ej: Cirugía programada"
                className="rounded-lg"
              />
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Crear bloqueo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
