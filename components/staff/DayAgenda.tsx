"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Phone,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { APPOINTMENT_STATUS, TRIAGE_URGENCY } from "@/lib/constants";
import { format, addDays, subDays, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { AppointmentCard } from "./AppointmentCard";
import { toast } from "sonner";

interface Appointment {
  id: string;
  start_ts: string;
  end_ts: string;
  status: string;
  guest_pet_name: string;
  guest_pet_species: string;
  guest_phone: string;
  guest_owner_name: string | null;
  reason_text: string | null;
  staff_notes: string | null;
  triage_summary: string | null;
  triage_urgency: string | null;
  created_by: string;
  services: { name_public: string; duration_minutes: number } | null;
  professionals: { display_name: string; color: string } | null;
  resources: { name: string } | null;
  reason_categories: { name: string } | null;
}

interface Block {
  id: string;
  start_ts: string;
  end_ts: string;
  type: string;
  note: string | null;
  resources: { name: string } | null;
  professionals: { display_name: string } | null;
}

interface DayAgendaProps {
  organizationId: string;
  centers: Array<{ id: string; name: string }>;
  professionals: Array<{ id: string; display_name: string; color: string }>;
  currentProfessionalId: string;
}

export function DayAgenda({
  organizationId,
  centers,
  professionals,
  currentProfessionalId,
}: DayAgendaProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCenter, setSelectedCenter] = useState(centers[0]?.id || "");
  const [selectedProfessional, setSelectedProfessional] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDayData = useCallback(async () => {
    if (!selectedCenter) return;
    setLoading(true);

    const supabase = createClient();
    const dayStart = format(currentDate, "yyyy-MM-dd") + "T00:00:00";
    const dayEnd = format(currentDate, "yyyy-MM-dd") + "T23:59:59";

    // Cargar citas del día
    let appointmentsQuery = supabase
      .from("appointments")
      .select(
        `
        id, start_ts, end_ts, status, guest_pet_name, guest_pet_species,
        guest_phone, guest_owner_name, reason_text, staff_notes,
        triage_summary, triage_urgency, created_by,
        services(name_public, duration_minutes),
        professionals!appointments_professional_id_fkey(display_name, color),
        resources(name),
        reason_categories(name)
      `
      )
      .eq("center_id", selectedCenter)
      .gte("start_ts", dayStart)
      .lte("start_ts", dayEnd)
      .neq("status", "cancelled")
      .order("start_ts");

    if (selectedProfessional !== "all") {
      appointmentsQuery = appointmentsQuery.eq(
        "professional_id",
        selectedProfessional
      );
    }

    // Cargar bloqueos del día
    const blocksQuery = supabase
      .from("blocks")
      .select(
        `
        id, start_ts, end_ts, type, note,
        resources(name),
        professionals!blocks_professional_id_fkey(display_name)
      `
      )
      .eq("center_id", selectedCenter)
      .gte("start_ts", dayStart)
      .lte("start_ts", dayEnd)
      .order("start_ts");

    const [appointmentsResult, blocksResult] = await Promise.all([
      appointmentsQuery,
      blocksQuery,
    ]);

    setAppointments((appointmentsResult.data as unknown as Appointment[]) || []);
    setBlocks((blocksResult.data as unknown as Block[]) || []);
    setLoading(false);
  }, [selectedCenter, selectedProfessional, currentDate]);

  useEffect(() => {
    fetchDayData();
  }, [fetchDayData]);

  // Cambiar estado de cita
  async function updateAppointmentStatus(id: string, status: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("appointments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar la cita");
    } else {
      toast.success("Cita actualizada");
      fetchDayData();
    }
  }

  const dateLabel = isToday(currentDate)
    ? `Hoy, ${format(currentDate, "d MMM yyyy", { locale: es })}`
    : format(currentDate, "EEEE, d MMM yyyy", { locale: es });

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(subDays(currentDate, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold capitalize">{dateLabel}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addDays(currentDate, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          {!isToday(currentDate) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="ml-1 text-xs"
            >
              Hoy
            </Button>
          )}
        </div>

        <Button size="sm" className="gap-1.5 rounded-lg">
          <Plus className="w-4 h-4" />
          Nueva cita
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {centers.length > 1 && (
          <Select value={selectedCenter} onValueChange={setSelectedCenter}>
            <SelectTrigger className="w-auto min-w-[140px] rounded-lg">
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

        <Select
          value={selectedProfessional}
          onValueChange={setSelectedProfessional}
        >
          <SelectTrigger className="w-auto min-w-[160px] rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {professionals.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.display_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de citas y bloqueos */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Cargando agenda...</span>
        </div>
      ) : appointments.length === 0 && blocks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay citas programadas para este día.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mezclar citas y bloqueos, ordenados por hora */}
          {[
            ...appointments.map((a) => ({ type: "appointment" as const, data: a, time: a.start_ts })),
            ...blocks.map((b) => ({ type: "block" as const, data: b, time: b.start_ts })),
          ]
            .sort(
              (a, b) =>
                new Date(a.time).getTime() - new Date(b.time).getTime()
            )
            .map((item) => {
              if (item.type === "appointment") {
                const apt = item.data as Appointment;
                return (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onStatusChange={updateAppointmentStatus}
                  />
                );
              }
              // Bloqueo
              const blk = item.data as Block;
              return (
                <div
                  key={blk.id}
                  className="rounded-xl border-l-4 border-l-destructive border border-border bg-destructive/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-destructive">
                      {format(new Date(blk.start_ts), "HH:mm")} -{" "}
                      {format(new Date(blk.end_ts), "HH:mm")}
                    </span>
                    <Badge variant="outline" className="text-destructive border-destructive/30">
                      {blk.type === "surgery"
                        ? "Cirugía"
                        : blk.type === "meeting"
                          ? "Reunión"
                          : blk.type === "break"
                            ? "Descanso"
                            : blk.type === "reserved_urgent"
                              ? "Reserva urgencias"
                              : "Bloqueado"}
                    </Badge>
                  </div>
                  {blk.note && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {blk.note}
                    </p>
                  )}
                  <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                    {blk.resources && <span>{(blk.resources as { name: string }).name}</span>}
                    {blk.professionals && (
                      <span>{(blk.professionals as { display_name: string }).display_name}</span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
