// Utilidades para normalización de teléfono

/**
 * Normaliza un número de teléfono español a formato internacional.
 * Acepta formatos: 600123456, +34600123456, 0034600123456, 34 600 123 456
 */
export function normalizePhone(phone: string): string {
  // Eliminar espacios, guiones y paréntesis
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

  // Si empieza con 0034, reemplazar por +34
  if (cleaned.startsWith("0034")) {
    cleaned = "+34" + cleaned.slice(4);
  }

  // Si empieza con 34 y tiene 11 dígitos, añadir +
  if (cleaned.startsWith("34") && cleaned.length === 11) {
    cleaned = "+" + cleaned;
  }

  // Si no tiene prefijo internacional y tiene 9 dígitos, añadir +34
  if (!cleaned.startsWith("+") && cleaned.length === 9) {
    cleaned = "+34" + cleaned;
  }

  return cleaned;
}

/**
 * Formatea un teléfono para mostrar al usuario: +34 600 123 456
 */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);

  if (normalized.startsWith("+34") && normalized.length === 12) {
    const digits = normalized.slice(3);
    return `+34 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  return normalized;
}

/**
 * Valida que el teléfono es un formato aceptable.
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);

  // Formato español: +34 seguido de 9 dígitos
  if (/^\+34\d{9}$/.test(normalized)) return true;

  // Formato internacional genérico: + seguido de 7-15 dígitos
  if (/^\+\d{7,15}$/.test(normalized)) return true;

  return false;
}
