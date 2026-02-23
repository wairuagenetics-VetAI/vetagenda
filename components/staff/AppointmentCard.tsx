"use client";

import { useState } from "react";
import { Phone, MessageSquare, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APPOINTMENT_STATUS, TRIAGE_URGENCY } from "@/lib/constants";
import { format } from "date-fns";

interface AppointmentData {
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

interface AppointmentCardProps {
  appointment: AppointmentData;
  onStatusChange: (id: string, status: string) => void;
}

export function AppointmentCard({
  appointment: apt,
  onStatusChange,
}: AppointmentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig =
    APPOINTMENT_STATUS[apt.status as keyof typeof APPOINTMENT_STATUS] ||
    APPOINTMENT_STATUS.booked;

  const profColor = (apt.professionals as { display_name: string; color: string } | null)?.color || "#4DA8DA";
  const serviceName = (apt.services as { name_public: string; duration_minutes: number } | null)?.name_public || "";
  const serviceDuration = (apt.services as { name_public: string; duration_minutes: number } | null)?.duration_minutes || 30;
  const resourceName = (apt.resources as { name: string } | null)?.name || "";
  const profName = (apt.professionals as { display_name: string; color: string } | null)?.display_name || "Sin asignar";
  const reasonName = (apt.reason_categories as { name: string } | null)?.name || "";

  return (
    <div
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{ borderLeftWidth: 4, borderLeftColor: profColor }}
    >
      <div className="p-4">
        {/* Fila superior: hora + estado */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {format(new Date(apt.start_ts), "HH:mm")}
            </span>
            <span className="text-xs text-muted-foreground">
              {serviceDuration} min
            </span>
          </div>
          <Badge variant="outline" className={statusConfig.color}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Info principal */}
        <div className="space-y-1">
          <p className="font-semibold">
            {apt.guest_pet_name} · {serviceName}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <a
              href={`tel:${apt.guest_phone}`}
              className="flex items-center gap-1 hover:text-accent"
            >
              <Phone className="w-3.5 h-3.5" />
              {apt.guest_phone}
            </a>
            {reasonName && <span>Motivo: {reasonName}</span>}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{profName}</span>
            {resourceName && <span>{resourceName}</span>}
          </div>
        </div>

        {/* Triaje si existe */}
        {apt.triage_summary && (
          <div className="mt-2 p-2 rounded-lg bg-muted text-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <MessageSquare className="w-3.5 h-3.5 text-accent" />
              <span className="font-medium text-xs">Triaje IA</span>
              {apt.triage_urgency && (
                <Badge
                  variant="outline"
                  className={
                    TRIAGE_URGENCY[
                      apt.triage_urgency as keyof typeof TRIAGE_URGENCY
                    ]?.color || ""
                  }
                >
                  {TRIAGE_URGENCY[
                    apt.triage_urgency as keyof typeof TRIAGE_URGENCY
                  ]?.label || apt.triage_urgency}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-xs">{apt.triage_summary}</p>
          </div>
        )}

        {/* Expandir para ver más detalles */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-2 text-sm">
            {apt.guest_owner_name && (
              <p>
                <span className="text-muted-foreground">Propietario:</span>{" "}
                {apt.guest_owner_name}
              </p>
            )}
            {apt.reason_text && (
              <p>
                <span className="text-muted-foreground">Descripción:</span>{" "}
                {apt.reason_text}
              </p>
            )}
            {apt.staff_notes && (
              <p>
                <span className="text-muted-foreground">Notas staff:</span>{" "}
                {apt.staff_notes}
              </p>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border">
          {apt.status === "pending" && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onStatusChange(apt.id, "booked")}
              className="rounded-lg text-xs"
            >
              Confirmar
            </Button>
          )}
          {(apt.status === "booked" || apt.status === "pending") && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(apt.id, "completed")}
                className="rounded-lg text-xs"
              >
                Completar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(apt.id, "cancelled")}
                className="rounded-lg text-xs text-destructive hover:text-destructive"
              >
                Cancelar
              </Button>
            </>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <>
                Menos <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Más <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
