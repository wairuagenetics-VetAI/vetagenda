// Constantes globales de VetAgenda

// Especies disponibles para mascotas
export const PET_SPECIES = [
  { value: "dog", label: "Perro" },
  { value: "cat", label: "Gato" },
  { value: "bird", label: "Ave" },
  { value: "rabbit", label: "Conejo" },
  { value: "reptile", label: "Reptil" },
  { value: "exotic", label: "Exótico" },
  { value: "other", label: "Otro" },
] as const;

export type PetSpecies = (typeof PET_SPECIES)[number]["value"];

// Estados de cita
export const APPOINTMENT_STATUS = {
  pending: { label: "Pendiente", color: "bg-warning/10 text-warning border-warning/20" },
  booked: { label: "Confirmada", color: "bg-success/10 text-success border-success/20" },
  cancelled: { label: "Cancelada", color: "bg-destructive/10 text-destructive border-destructive/20" },
  no_show: { label: "No asistió", color: "bg-muted text-muted-foreground border-border" },
  completed: { label: "Completada", color: "bg-primary/10 text-primary border-primary/20" },
} as const;

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS;

// Tipos de recurso
export const RESOURCE_TYPES = [
  { value: "consult_room", label: "Consulta" },
  { value: "surgery_room", label: "Quirófano" },
  { value: "imaging", label: "Imagen" },
  { value: "other", label: "Otro" },
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number]["value"];

// Tipos de bloqueo
export const BLOCK_TYPES = [
  { value: "blocked", label: "Bloqueado" },
  { value: "surgery", label: "Cirugía" },
  { value: "meeting", label: "Reunión" },
  { value: "break", label: "Descanso" },
  { value: "reserved_urgent", label: "Reserva urgencias" },
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number]["value"];

// Roles del staff
export const STAFF_ROLES = {
  owner: { label: "Propietario", description: "Acceso completo: configuración, facturación, usuarios" },
  manager: { label: "Gestor", description: "Gestión operativa: horarios, recursos, servicios" },
  staff: { label: "Personal", description: "Ver agenda, crear/cancelar citas, bloquear" },
  viewer: { label: "Solo lectura", description: "Solo puede ver la agenda" },
} as const;

export type StaffRole = keyof typeof STAFF_ROLES;

// Niveles de urgencia del triaje
export const TRIAGE_URGENCY = {
  low: { label: "Baja", color: "bg-success/10 text-success border-success/20" },
  normal: { label: "Normal", color: "bg-accent/10 text-accent border-accent/20" },
  high: { label: "Alta", color: "bg-warning/10 text-warning border-warning/20" },
  emergency: { label: "Emergencia", color: "bg-destructive/10 text-destructive border-destructive/20" },
} as const;

export type TriageUrgency = keyof typeof TRIAGE_URGENCY;

// Días de la semana (0=Domingo, formato estándar JS)
export const DAYS_OF_WEEK = [
  { value: 0, label: "Domingo", short: "Dom" },
  { value: 1, label: "Lunes", short: "Lun" },
  { value: 2, label: "Martes", short: "Mar" },
  { value: 3, label: "Miércoles", short: "Mié" },
  { value: 4, label: "Jueves", short: "Jue" },
  { value: 5, label: "Viernes", short: "Vie" },
  { value: 6, label: "Sábado", short: "Sáb" },
] as const;

// Iconos Lucide para servicios
export const SERVICE_ICONS: Record<string, string> = {
  syringe: "Syringe",
  stethoscope: "Stethoscope",
  "clipboard-list": "ClipboardList",
  scan: "Scan",
  brain: "Brain",
  heart: "Heart",
  bone: "Bone",
  eye: "Eye",
  scissors: "Scissors",
  pill: "Pill",
};

// Colores por defecto para profesionales
export const PROFESSIONAL_COLORS = [
  "#1A4A7A",
  "#4DA8DA",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

// Zona horaria por defecto
export const DEFAULT_TIMEZONE = "Europe/Madrid";

// Duración máxima de audio en segundos
export const MAX_AUDIO_DURATION = 90;

// Tamaño máximo de logo en bytes (300KB)
export const MAX_LOGO_SIZE = 300 * 1024;
