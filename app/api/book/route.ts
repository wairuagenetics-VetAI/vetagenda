// API Route: /api/book
// Reserva una cita usando la función RPC atómica rpc_book_appointment.

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
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
      return NextResponse.json(
        { error: "center_id, service_id y start_ts son obligatorios" },
        { status: 400 }
      );
    }

    if (!guest_pet_name || !guest_phone) {
      return NextResponse.json(
        { error: "El nombre de la mascota y teléfono son obligatorios" },
        { status: 400 }
      );
    }

    if (!consent_privacy || !consent_data_accuracy) {
      return NextResponse.json(
        { error: "Debes aceptar los consentimientos obligatorios" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

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

      const errorMessages: Record<string, string> = {
        "Consentimientos obligatorios no aceptados":
          "Debes aceptar los consentimientos obligatorios",
        "Servicio no encontrado o inactivo":
          "El servicio seleccionado no está disponible",
        "Centro no encontrado": "Centro no encontrado",
        "No hay consultas disponibles en ese horario":
          "Lo sentimos, ese horario ya no está disponible. Por favor, selecciona otro.",
        "El profesional seleccionado no está disponible en ese horario":
          "El profesional seleccionado ya no está disponible en ese horario.",
      };

      const friendlyMessage =
        errorMessages[error.message] ||
        "No se pudo reservar la cita. Inténtalo de nuevo.";

      return NextResponse.json({ error: friendlyMessage }, { status: 409 });
    }

    const appointmentId = data;

    // Cargar datos de la cita
    const { data: appointment } = await supabase
      .from("appointments")
      .select(
        `id, start_ts, end_ts, status, guest_pet_name, guest_pet_species,
        services(name_public, duration_minutes),
        centers(name, address),
        professionals!appointments_professional_id_fkey(display_name)`
      )
      .eq("id", appointmentId)
      .single();

    return NextResponse.json({
      appointment_id: appointmentId,
      id: appointmentId,
      appointment: appointment || null,
    });
  } catch (err) {
    console.error("book error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Error al reservar la cita" },
      { status: 500 }
    );
  }
}
