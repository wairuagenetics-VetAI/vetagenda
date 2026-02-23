"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useStaffOrg } from "@/lib/hooks/useStaffOrg";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { toast } from "sonner";

interface ScheduleRule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  label: string | null;
}

interface ScheduleException {
  id: string;
  date: string;
  is_closed: boolean;
  custom_start: string | null;
  custom_end: string | null;
  note: string | null;
}

export default function SchedulePage() {
  const { organizationId, loading: orgLoading } = useStaffOrg();
  const [centers, setCenters] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);

  // Diálogos
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [exceptionDialogOpen, setExceptionDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form regla
  const [ruleDow, setRuleDow] = useState("1");
  const [ruleStart, setRuleStart] = useState("09:00");
  const [ruleEnd, setRuleEnd] = useState("13:30");
  const [ruleLabel, setRuleLabel] = useState("");

  // Form excepción
  const [excDate, setExcDate] = useState("");
  const [excClosed, setExcClosed] = useState(true);
  const [excNote, setExcNote] = useState("");

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

  const fetchData = useCallback(async () => {
    if (!selectedCenter) return;
    setLoading(true);
    const supabase = createClient();

    const [rulesRes, excRes] = await Promise.all([
      supabase
        .from("schedule_rules")
        .select("*")
        .eq("center_id", selectedCenter)
        .order("day_of_week")
        .order("start_time"),
      supabase
        .from("schedule_exceptions")
        .select("*")
        .eq("center_id", selectedCenter)
        .order("date"),
    ]);

    setRules((rulesRes.data as ScheduleRule[]) || []);
    setExceptions((excRes.data as ScheduleException[]) || []);
    setLoading(false);
  }, [selectedCenter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function addRule() {
    if (ruleStart >= ruleEnd) {
      toast.error("La hora de fin debe ser posterior a la de inicio");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("schedule_rules").insert({
      center_id: selectedCenter,
      day_of_week: parseInt(ruleDow),
      start_time: ruleStart,
      end_time: ruleEnd,
      label: ruleLabel.trim() || null,
    });

    if (error) toast.error("Error al crear horario");
    else toast.success("Horario añadido");

    setSaving(false);
    setRuleDialogOpen(false);
    fetchData();
  }

  async function deleteRule(id: string) {
    const supabase = createClient();
    await supabase.from("schedule_rules").delete().eq("id", id);
    fetchData();
  }

  async function addException() {
    if (!excDate) {
      toast.error("La fecha es obligatoria");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("schedule_exceptions").insert({
      center_id: selectedCenter,
      date: excDate,
      is_closed: excClosed,
      note: excNote.trim() || null,
    });

    if (error) toast.error("Error al crear excepción");
    else toast.success("Excepción añadida");

    setSaving(false);
    setExceptionDialogOpen(false);
    setExcDate("");
    setExcNote("");
    fetchData();
  }

  async function deleteException(id: string) {
    const supabase = createClient();
    await supabase.from("schedule_exceptions").delete().eq("id", id);
    fetchData();
  }

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Agrupar reglas por día
  const rulesByDay = DAYS_OF_WEEK.map((day) => ({
    ...day,
    rules: rules.filter((r) => r.day_of_week === day.value),
  }));

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold">Horarios</h1>

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

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Horarios semanales */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Horario semanal</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRuleDialogOpen(true)}
                className="gap-1.5 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Añadir franja
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {rulesByDay.map((day) => (
                <div
                  key={day.value}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="font-medium text-sm w-20">{day.label}</span>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {day.rules.length === 0 ? (
                      <span className="text-xs text-muted-foreground">
                        Cerrado
                      </span>
                    ) : (
                      day.rules.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center gap-1 bg-accent/10 text-accent text-xs px-2 py-1 rounded-md"
                        >
                          <span>
                            {r.start_time.slice(0, 5)} - {r.end_time.slice(0, 5)}
                          </span>
                          {r.label && (
                            <span className="text-muted-foreground">
                              ({r.label})
                            </span>
                          )}
                          <button
                            onClick={() => deleteRule(r.id)}
                            className="ml-1 hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Excepciones / Festivos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Festivos y excepciones</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExceptionDialogOpen(true)}
                className="gap-1.5 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </Button>
            </div>

            {exceptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay excepciones configuradas.
              </p>
            ) : (
              <div className="space-y-2">
                {exceptions.map((exc) => (
                  <div
                    key={exc.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{exc.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {exc.is_closed ? "Cerrado" : "Horario especial"}
                        {exc.note && ` · ${exc.note}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteException(exc.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Diálogo nueva franja */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva franja horaria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Día de la semana</Label>
              <Select value={ruleDow} onValueChange={setRuleDow}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((d) => (
                    <SelectItem key={d.value} value={d.value.toString()}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Hora inicio</Label>
                <Input
                  type="time"
                  value={ruleStart}
                  onChange={(e) => setRuleStart(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Hora fin</Label>
                <Input
                  type="time"
                  value={ruleEnd}
                  onChange={(e) => setRuleEnd(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Etiqueta (opcional)</Label>
              <Input
                value={ruleLabel}
                onChange={(e) => setRuleLabel(e.target.value)}
                placeholder="Ej: Mañana, Tarde"
                className="rounded-lg"
              />
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={addRule}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Añadir franja
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo nueva excepción */}
      <Dialog
        open={exceptionDialogOpen}
        onOpenChange={setExceptionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva excepción</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={excDate}
                onChange={(e) => setExcDate(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Cerrado todo el día</Label>
              <Switch checked={excClosed} onCheckedChange={setExcClosed} />
            </div>
            <div className="space-y-1.5">
              <Label>Nota (opcional)</Label>
              <Input
                value={excNote}
                onChange={(e) => setExcNote(e.target.value)}
                placeholder="Ej: Festivo local"
                className="rounded-lg"
              />
            </div>
            <Button
              className="w-full rounded-xl"
              onClick={addException}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Añadir excepción
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
