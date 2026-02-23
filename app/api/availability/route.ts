// API Route: /api/availability
// Calcula los slots disponibles para un centro, servicio y fecha dados.

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { center_id, service_id, date } = await req.json();

    if (!center_id || !service_id || !date) {
      return NextResponse.json(
        { error: "center_id, service_id y date son obligatorios" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // 1) Cargar servicio
    const { data: service, error: serviceErr } = await supabase
      .from("services")
      .select("*")
      .eq("id", service_id)
      .eq("is_active", true)
      .single();

    if (serviceErr || !service) {
      return NextResponse.json(
        { error: "Servicio no encontrado o inactivo" },
        { status: 404 }
      );
    }

    const durationMinutes: number = service.duration_minutes;

    // 2) Verificar centro
    const { data: center } = await supabase
      .from("centers")
      .select("organization_id")
      .eq("id", center_id)
      .single();

    if (!center) {
      return NextResponse.json(
        { error: "Centro no encontrado" },
        { status: 404 }
      );
    }

    // 3) Comprobar schedule_exceptions
    const { data: exceptions } = await supabase
      .from("schedule_exceptions")
      .select("*")
      .eq("center_id", center_id)
      .eq("date", date);

    const closedException = exceptions?.find((e: any) => e.is_closed);
    if (closedException) {
      return NextResponse.json({ slots: [] });
    }

    // 4) Obtener horario del día
    const dateObj = new Date(date + "T12:00:00Z");
    const dayOfWeek = dateObj.getUTCDay();

    const customException = exceptions?.find(
      (e: any) => !e.is_closed && e.custom_start && e.custom_end
    );

    let timeWindows: Array<{ start: string; end: string }> = [];

    if (customException) {
      timeWindows = [
        { start: customException.custom_start, end: customException.custom_end },
      ];
    } else {
      const { data: rules } = await supabase
        .from("schedule_rules")
        .select("*")
        .eq("center_id", center_id)
        .eq("day_of_week", dayOfWeek)
        .eq("is_active", true)
        .order("start_time");

      if (!rules || rules.length === 0) {
        return NextResponse.json({ slots: [] });
      }

      timeWindows = rules.map((r: any) => ({
        start: r.start_time,
        end: r.end_time,
      }));
    }

    // 5) Generar slots candidatos
    const candidateSlots: Array<{ start: string; end: string }> = [];

    for (const window of timeWindows) {
      const [startH, startM] = window.start.split(":").map(Number);
      const [endH, endM] = window.end.split(":").map(Number);
      const windowStartMinutes = startH * 60 + startM;
      const windowEndMinutes = endH * 60 + endM;

      let cursor = windowStartMinutes;
      while (cursor + durationMinutes <= windowEndMinutes) {
        const slotStartH = String(Math.floor(cursor / 60)).padStart(2, "0");
        const slotStartM = String(cursor % 60).padStart(2, "0");
        const slotEndMinutes = cursor + durationMinutes;
        const slotEndH = String(Math.floor(slotEndMinutes / 60)).padStart(2, "0");
        const slotEndM = String(slotEndMinutes % 60).padStart(2, "0");

        candidateSlots.push({
          start: `${slotStartH}:${slotStartM}`,
          end: `${slotEndH}:${slotEndM}`,
        });

        cursor += durationMinutes;
      }
    }

    if (candidateSlots.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // 6) Cargar recursos activos del tipo requerido
    const { data: resources } = await supabase
      .from("resources")
      .select("*")
      .eq("center_id", center_id)
      .eq("type", service.resource_type_required)
      .order("sort_order");

    if (!resources || resources.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // Filtrar recursos activos considerando overrides
    const { data: overrides } = await supabase
      .from("resource_overrides")
      .select("*")
      .in("resource_id", resources.map((r: any) => r.id))
      .lte("date_start", date)
      .gte("date_end", date);

    const activeResources = resources.filter((r: any) => {
      const override = overrides?.find((o: any) => o.resource_id === r.id);
      return override ? override.is_active : r.is_active_default;
    });

    if (activeResources.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    // 7) Cargar profesionales elegibles
    const { data: serviceProfessionals } = await supabase
      .from("service_professionals")
      .select("professional_id, professionals!inner(id, display_name, is_active)")
      .eq("service_id", service_id);

    const { data: centerProfessionals } = await supabase
      .from("professional_centers")
      .select("professional_id")
      .eq("center_id", center_id);

    const centerProfIds = new Set(
      (centerProfessionals || []).map((pc: any) => pc.professional_id)
    );

    const eligibleProfessionals = (serviceProfessionals || [])
      .filter((sp: any) => {
        const prof = sp.professionals;
        return prof && prof.is_active && centerProfIds.has(sp.professional_id);
      })
      .map((sp: any) => ({
        id: sp.professional_id,
        name: sp.professionals.display_name,
      }));

    // 8) Cargar citas y bloqueos del día
    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;

    const { data: existingAppointments } = await supabase
      .from("appointments")
      .select("resource_id, professional_id, start_ts, end_ts, status")
      .eq("center_id", center_id)
      .gte("start_ts", dayStart)
      .lte("start_ts", dayEnd)
      .not("status", "eq", "cancelled");

    const { data: existingBlocks } = await supabase
      .from("blocks")
      .select("resource_id, professional_id, center_id, start_ts, end_ts")
      .eq("center_id", center_id)
      .gte("start_ts", dayStart)
      .lte("start_ts", dayEnd);

    // 9) Verificar disponibilidad de cada slot
    const availableSlots: Array<{
      start: string;
      end: string;
      available_professionals: Array<{ id: string; name: string }>;
    }> = [];

    const now = new Date();

    for (const slot of candidateSlots) {
      const slotStartTs = new Date(`${date}T${slot.start}:00Z`);
      const slotEndTs = new Date(`${date}T${slot.end}:00Z`);

      // No mostrar slots que ya pasaron (con margen de 1h para timezone)
      if (slotStartTs.getTime() < now.getTime() - 3600000) continue;

      // Verificar si hay al menos un recurso libre
      const freeResource = activeResources.some((r: any) => {
        const hasAppointment = (existingAppointments || []).some((a: any) => {
          if (a.resource_id !== r.id) return false;
          const aStart = new Date(a.start_ts);
          const aEnd = new Date(a.end_ts);
          return aStart < slotEndTs && aEnd > slotStartTs;
        });

        const hasBlock = (existingBlocks || []).some((b: any) => {
          const matchesResource =
            b.resource_id === r.id ||
            (!b.resource_id && b.center_id === center_id);
          if (!matchesResource) return false;
          const bStart = new Date(b.start_ts);
          const bEnd = new Date(b.end_ts);
          return bStart < slotEndTs && bEnd > slotStartTs;
        });

        return !hasAppointment && !hasBlock;
      });

      if (!freeResource) continue;

      // Verificar profesionales disponibles
      const availableProfs = eligibleProfessionals.filter((prof) => {
        const hasAppointment = (existingAppointments || []).some((a: any) => {
          if (a.professional_id !== prof.id) return false;
          const aStart = new Date(a.start_ts);
          const aEnd = new Date(a.end_ts);
          return aStart < slotEndTs && aEnd > slotStartTs;
        });

        const hasBlock = (existingBlocks || []).some((b: any) => {
          if (b.professional_id !== prof.id) return false;
          const bStart = new Date(b.start_ts);
          const bEnd = new Date(b.end_ts);
          return bStart < slotEndTs && bEnd > slotStartTs;
        });

        return !hasAppointment && !hasBlock;
      });

      if (eligibleProfessionals.length > 0 && availableProfs.length === 0) {
        continue;
      }

      availableSlots.push({
        start: slot.start,
        end: slot.end,
        available_professionals: availableProfs,
      });
    }

    return NextResponse.json({ slots: availableSlots });
  } catch (err) {
    console.error("availability error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Error interno" },
      { status: 500 }
    );
  }
}
