// Edge Function: availability
// Calcula los slots disponibles para un centro, servicio y fecha dados.
// Tiene en cuenta: schedule_rules, schedule_exceptions, appointments existentes,
// blocks, recursos activos y profesionales disponibles.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

interface SlotResult {
  start: string;
  end: string;
  available_professionals: Array<{ id: string; name: string }>;
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { center_id, service_id, date } = await req.json();

    if (!center_id || !service_id || !date) {
      return new Response(
        JSON.stringify({ error: "center_id, service_id y date son obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1) Cargar servicio
    const { data: service, error: serviceErr } = await supabase
      .from("services")
      .select("*")
      .eq("id", service_id)
      .eq("is_active", true)
      .single();

    if (serviceErr || !service) {
      return new Response(
        JSON.stringify({ error: "Servicio no encontrado o inactivo" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const durationMinutes: number = service.duration_minutes;

    // 2) Obtener timezone de la organización
    const { data: center } = await supabase
      .from("centers")
      .select("organization_id")
      .eq("id", center_id)
      .single();

    if (!center) {
      return new Response(
        JSON.stringify({ error: "Centro no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("timezone")
      .eq("id", center.organization_id)
      .single();

    const timezone = org?.timezone || "Europe/Madrid";

    // 3) Comprobar schedule_exceptions (¿el día está cerrado?)
    const { data: exceptions } = await supabase
      .from("schedule_exceptions")
      .select("*")
      .eq("center_id", center_id)
      .eq("date", date);

    const closedException = exceptions?.find((e: any) => e.is_closed);
    if (closedException) {
      return new Response(
        JSON.stringify({ slots: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4) Obtener schedule_rules para el día de la semana
    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay(); // 0=domingo, 6=sábado

    // Comprobar si hay excepción con horario personalizado
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
        return new Response(
          JSON.stringify({ slots: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      timeWindows = rules.map((r: any) => ({
        start: r.start_time,
        end: r.end_time,
      }));
    }

    // 5) Generar slots candidatos a partir de las ventanas horarias
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
      return new Response(
        JSON.stringify({ slots: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 6) Cargar recursos activos del tipo requerido por el servicio
    const { data: resources } = await supabase
      .from("resources")
      .select("*")
      .eq("center_id", center_id)
      .eq("type", service.resource_type_required)
      .order("sort_order");

    if (!resources || resources.length === 0) {
      return new Response(
        JSON.stringify({ slots: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
      return new Response(
        JSON.stringify({ slots: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 7) Cargar profesionales que pueden dar este servicio en este centro
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

    // 8) Cargar citas y bloqueos existentes para el día
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

    // 9) Para cada slot candidato, verificar disponibilidad
    const availableSlots: SlotResult[] = [];

    for (const slot of candidateSlots) {
      const slotStartTs = new Date(`${date}T${slot.start}:00`);
      const slotEndTs = new Date(`${date}T${slot.end}:00`);

      // No mostrar slots que ya pasaron
      const now = new Date();
      if (slotStartTs <= now) continue;

      // Verificar si hay al menos un recurso libre
      const freeResource = activeResources.some((r: any) => {
        // Comprobar que no hay cita en ese recurso
        const hasAppointment = (existingAppointments || []).some((a: any) => {
          if (a.resource_id !== r.id) return false;
          const aStart = new Date(a.start_ts);
          const aEnd = new Date(a.end_ts);
          return aStart < slotEndTs && aEnd > slotStartTs;
        });

        // Comprobar que no hay bloqueo
        const hasBlock = (existingBlocks || []).some((b: any) => {
          const matchesResource = b.resource_id === r.id || (!b.resource_id && b.center_id === center_id);
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

      // Si el servicio requiere profesional y no hay ninguno libre, saltar
      if (eligibleProfessionals.length > 0 && availableProfs.length === 0) {
        continue;
      }

      availableSlots.push({
        start: slot.start,
        end: slot.end,
        available_professionals: availableProfs,
      });
    }

    return new Response(
      JSON.stringify({ slots: availableSlots }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("availability error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Error interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
