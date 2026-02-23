"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";

interface TimeSlot {
  start: string;
  end: string;
  available_professionals: Array<{ id: string; name: string }>;
}

export default function SlotsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service") || "";
  const centerId = searchParams.get("center") || "";
  const [slug, setSlug] = useState("");

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceDuration, setServiceDuration] = useState(30);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Cargar info del servicio
  useEffect(() => {
    if (!serviceId) return;
    const supabase = createClient();
    supabase
      .from("services")
      .select("name_public, duration_minutes")
      .eq("id", serviceId)
      .single()
      .then(({ data }) => {
        if (data) {
          setServiceName(data.name_public);
          setServiceDuration(data.duration_minutes);
        }
      });
  }, [serviceId]);

  // Cargar slots cuando se selecciona un día
  const fetchSlots = useCallback(
    async (date: Date) => {
      if (!centerId || !serviceId) return;
      setLoading(true);
      setSlots([]);
      setSelectedSlot(null);

      try {
        const supabase = createClient();
        const dateStr = format(date, "yyyy-MM-dd");

        const { data, error } = await supabase.functions.invoke(
          "availability",
          {
            body: {
              center_id: centerId,
              service_id: serviceId,
              date: dateStr,
            },
          }
        );

        if (error) {
          console.error("Error al cargar disponibilidad:", error);
          setSlots([]);
        } else if (data?.slots) {
          setSlots(data.slots);
        }
      } catch {
        console.error("Error al consultar disponibilidad");
      } finally {
        setLoading(false);
      }
    },
    [centerId, serviceId]
  );

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [selectedDate, fetchSlots]);

  // Generar días del calendario
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding para que el mes empiece en el día correcto (lunes=0)
  const startDayIndex = (getDay(monthStart) + 6) % 7;

  function handleDateClick(date: Date) {
    if (isBefore(date, startOfDay(new Date()))) return;
    setSelectedDate(date);
  }

  function handleContinue() {
    if (!selectedSlot || !selectedDate || !slug) return;
    const qp = new URLSearchParams({
      service: serviceId,
      center: centerId,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedSlot,
    });
    router.push(`/${slug}/book/details?${qp.toString()}`);
  }

  // Agrupar slots por franja horaria
  const morningSlots = slots.filter(
    (s) => parseInt(s.start.split(":")[0]) < 14
  );
  const afternoonSlots = slots.filter(
    (s) => parseInt(s.start.split(":")[0]) >= 14
  );

  const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={slug ? `/${slug}/book` : "#"}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Elige horario</h1>
          {serviceName && (
            <p className="text-sm text-muted-foreground">
              {serviceName} · {serviceDuration} min
            </p>
          )}
        </div>
      </div>

      {/* Calendario */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startDayIndex }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}

          {calendarDays.map((day) => {
            const isPast = isBefore(day, startOfDay(new Date()));
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                disabled={isPast}
                className={`
                  aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                  ${isPast ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-accent/10 cursor-pointer"}
                  ${isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                  ${today && !isSelected ? "ring-1 ring-accent text-accent font-bold" : ""}
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots de hora */}
      {selectedDate && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Consultando disponibilidad...</span>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay horarios disponibles para este día.</p>
              <p className="text-sm mt-1">Prueba con otra fecha.</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground">
                Horarios disponibles para el{" "}
                <span className="text-foreground font-semibold">
                  {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                </span>
              </p>

              {morningSlots.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Mañana</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {morningSlots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedSlot(slot.start)}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                          selectedSlot === slot.start
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:border-accent hover:text-accent"
                        }`}
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {afternoonSlots.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tarde</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {afternoonSlots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => setSelectedSlot(slot.start)}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                          selectedSlot === slot.start
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border hover:border-accent hover:text-accent"
                        }`}
                      >
                        {slot.start}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Botón continuar */}
      {selectedSlot && (
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full rounded-xl"
        >
          Continuar
        </Button>
      )}
    </div>
  );
}
