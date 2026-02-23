// Edge Function: book
// Reserva una cita a través de la función RPC atómica rpc_book_appointment.
// Recibe los datos del formulario público y devuelve el appointment_id.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      center_id,
      service_id,
      start_ts,
      guest_pet_name,
      guest_pet_species,
      guest_phone,
      guest_owner_name,
      guest_microchip,
      reason_category_id,
      reason_text,
      consent_privacy,
      consent_data_accuracy,
      professional_id,
      triage_summary,
      triage_urgency,
    } = body;

    // Validaciones básicas
    if (!center_id || !service_id || !start_ts) {
      return new Response(
        JSON.stringify({ error: "center_id, service_id y start_ts son obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!guest_pet_name || !guest_phone) {
      return new Response(
        JSON.stringify({ error: "El nombre de la mascota y teléfono son obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!consent_privacy || !consent_data_accuracy) {
      return new Response(
        JSON.stringify({ error: "Debes aceptar los consentimientos obligatorios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Llamar a la función RPC atómica
    const { data, error } = await supabase.rpc("rpc_book_appointment", {
      p_center_id: center_id,
      p_service_id: service_id,
      p_start_ts: start_ts,
      p_professional_id: professional_id || null,
      p_guest_pet_name: guest_pet_name,
      p_guest_pet_species: guest_pet_species || "dog",
      p_guest_phone: guest_phone,
      p_guest_owner_name: guest_owner_name || null,
      p_guest_microchip: guest_microchip || null,
      p_reason_category_id: reason_category_id || null,
      p_reason_text: reason_text || null,
      p_consent_privacy: consent_privacy,
      p_consent_data_accuracy: consent_data_accuracy,
      p_triage_summary: triage_summary || null,
      p_triage_urgency: triage_urgency || null,
    });

    if (error) {
      console.error("rpc_book_appointment error:", error);

      // Mensajes de error amigables
      const errorMessages: Record<string, string> = {
        "Consentimientos obligatorios no aceptados":
          "Debes aceptar los consentimientos obligatorios",
        "Servicio no encontrado o inactivo":
          "El servicio seleccionado no está disponible",
        "Centro no encontrado":
          "Centro no encontrado",
        "No hay consultas disponibles en ese horario":
          "Lo sentimos, ese horario ya no está disponible. Por favor, selecciona otro.",
        "El profesional seleccionado no está disponible en ese horario":
          "El profesional seleccionado ya no está disponible en ese horario.",
      };

      const friendlyMessage =
        errorMessages[error.message] || "No se pudo reservar la cita. Inténtalo de nuevo.";

      return new Response(
        JSON.stringify({ error: friendlyMessage }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // data es el UUID del appointment devuelto por la función
    const appointmentId = data;

    // Cargar datos de la cita para la respuesta
    const { data: appointment } = await supabase
      .from("appointments")
      .select(`
        id, start_ts, end_ts, status, guest_pet_name, guest_pet_species,
        services(name_public, duration_minutes),
        centers(name, address),
        professionals(display_name)
      `)
      .eq("id", appointmentId)
      .single();

    return new Response(
      JSON.stringify({
        appointment_id: appointmentId,
        id: appointmentId,
        appointment: appointment || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("book error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Error al reservar la cita" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
