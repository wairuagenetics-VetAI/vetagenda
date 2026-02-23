// Validaciones con Zod para formularios de VetAgenda

import { z } from "zod";
import { isValidPhone } from "./phone";

// Esquema de validación para reserva de cita (datos del cliente)
export const bookingFormSchema = z.object({
  guest_pet_name: z
    .string()
    .min(1, "El nombre de la mascota es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  guest_pet_species: z.enum(["dog", "cat", "bird", "rabbit", "reptile", "exotic", "other"], {
    message: "Selecciona la especie",
  }),
  guest_phone: z
    .string()
    .min(1, "El teléfono es obligatorio")
    .refine(isValidPhone, "Introduce un número de teléfono válido"),
  guest_owner_name: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  guest_microchip: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .optional()
    .or(z.literal("")),
  reason_category_id: z.string().optional().or(z.literal("")),
  reason_text: z
    .string()
    .max(1000, "Máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
  consent_privacy: z
    .boolean()
    .refine((v) => v === true, "Debes aceptar la política de privacidad"),
  consent_data_accuracy: z
    .boolean()
    .refine((v) => v === true, "Debes confirmar que los datos son correctos"),
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

// Esquema para creación manual de cita por staff
export const manualBookingSchema = bookingFormSchema.extend({
  center_id: z.string().uuid("Centro no válido"),
  service_id: z.string().uuid("Servicio no válido"),
  professional_id: z.string().uuid("Profesional no válido").optional().or(z.literal("")),
  start_ts: z.string().min(1, "Selecciona un horario"),
  staff_notes: z.string().max(2000, "Máximo 2000 caracteres").optional().or(z.literal("")),
});

export type ManualBookingData = z.infer<typeof manualBookingSchema>;

// Esquema para bloqueo
export const blockSchema = z.object({
  center_id: z.string().uuid(),
  resource_id: z.string().uuid().optional().or(z.literal("")),
  professional_id: z.string().uuid().optional().or(z.literal("")),
  start_ts: z.string().min(1, "Fecha de inicio obligatoria"),
  end_ts: z.string().min(1, "Fecha de fin obligatoria"),
  type: z.enum(["blocked", "surgery", "meeting", "break", "reserved_urgent"]),
  note: z.string().max(500, "Máximo 500 caracteres").optional().or(z.literal("")),
});

export type BlockFormData = z.infer<typeof blockSchema>;

// Esquema para branding de la clínica
export const brandingSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  description: z.string().max(500).optional().or(z.literal("")),
  brand_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color no válido")
    .optional(),
  accent_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color no válido")
    .optional(),
  contact_phone: z.string().max(20).optional().or(z.literal("")),
  contact_email: z.string().email("Email no válido").optional().or(z.literal("")),
  emergency_message: z.string().max(300).optional().or(z.literal("")),
});

export type BrandingFormData = z.infer<typeof brandingSchema>;
