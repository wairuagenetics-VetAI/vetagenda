"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Calendar,
  Stethoscope,
  PawPrint,
  CalendarPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const searchParams = useSearchParams();
  const [slug, setSlug] = useState("");

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  const petName = searchParams.get("pet") || "";
  const serviceName = searchParams.get("service") || "";
  const dateStr = searchParams.get("date") || "";
  const timeStr = searchParams.get("time") || "";

  const displayDate = dateStr
    ? format(
        parse(dateStr, "yyyy-MM-dd", new Date()),
        "EEEE d 'de' MMMM 'de' yyyy",
        { locale: es }
      )
    : "";

  // Generar archivo .ics para añadir al calendario
  function generateICS() {
    if (!dateStr || !timeStr) return;

    const startDate = new Date(`${dateStr}T${timeStr}:00`);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    const pad = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//VetAgenda//ES",
      "BEGIN:VEVENT",
      `DTSTART:${pad(startDate)}`,
      `DTEND:${pad(endDate)}`,
      `SUMMARY:${serviceName} - ${petName}`,
      `DESCRIPTION:Cita veterinaria para ${petName}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cita-${petName.toLowerCase().replace(/\s/g, "-")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 text-center py-8">
      {/* Icono de éxito */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
      </div>

      <h1 className="text-2xl font-bold">¡Cita reservada!</h1>

      {/* Tarjeta de resumen */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3 text-left mx-auto max-w-sm">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm capitalize">{displayDate}</span>
          <span className="text-sm font-semibold">{timeStr}</span>
        </div>
        <div className="flex items-center gap-3">
          <Stethoscope className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm">{serviceName}</span>
        </div>
        <div className="flex items-center gap-3">
          <PawPrint className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm">{petName}</span>
        </div>
      </div>

      {/* Botón añadir al calendario */}
      <Button
        variant="outline"
        className="rounded-xl gap-2"
        onClick={generateICS}
      >
        <CalendarPlus className="w-4 h-4" />
        Añadir al calendario
      </Button>

      {/* Info de cancelación */}
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        Si necesitas cancelar o modificar tu cita, contacta directamente con la
        clínica.
      </p>

      {/* Link volver */}
      {slug && (
        <Link href={`/${slug}`}>
          <Button variant="ghost" className="text-accent">
            Volver al inicio
          </Button>
        </Link>
      )}
    </div>
  );
}
