"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useStaffOrg } from "@/lib/hooks/useStaffOrg";
import { APPOINTMENT_STATUS } from "@/lib/constants";
import { AppointmentCard } from "@/components/staff/AppointmentCard";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AppointmentsPage() {
  const { organizationId, loading: orgLoading } = useStaffOrg();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAppointments = useCallback(async () => {
    if (!organizationId) return;
    setLoading(true);
    const supabase = createClient();

    let query = supabase
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
      .eq("organization_id", organizationId)
      .order("start_ts", { ascending: false })
      .limit(50);

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    if (search.trim()) {
      query = query.or(
        `guest_pet_name.ilike.%${search}%,guest_phone.ilike.%${search}%,guest_owner_name.ilike.%${search}%`
      );
    }

    const { data } = await query;
    setAppointments(data || []);
    setLoading(false);
  }, [organizationId, statusFilter, search]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  async function updateStatus(id: string, status: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("appointments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) toast.error("Error al actualizar");
    else {
      toast.success("Cita actualizada");
      fetchAppointments();
    }
  }

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-xl font-bold">Citas</h1>

      {/* Búsqueda y filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono..."
            className="pl-9 rounded-lg"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-auto min-w-[140px] rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(APPOINTMENT_STATUS).map(([key, val]) => (
              <SelectItem key={key} value={key}>
                {val.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : appointments.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No se encontraron citas.
        </p>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt.id}>
              <p className="text-xs text-muted-foreground mb-1 ml-1">
                {format(new Date(apt.start_ts), "dd/MM/yyyy")}
              </p>
              <AppointmentCard
                appointment={apt}
                onStatusChange={updateStatus}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
