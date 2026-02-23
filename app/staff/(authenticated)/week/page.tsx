"use client";

import { CalendarRange } from "lucide-react";

// Vista semanal - Fase 2
export default function WeekPage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <CalendarRange className="w-12 h-12 mb-4" />
      <h1 className="text-xl font-bold text-foreground mb-2">Vista semanal</h1>
      <p className="max-w-sm">
        La vista semanal del calendario estará disponible en la próxima
        actualización. Por ahora usa la agenda diaria desde el Dashboard.
      </p>
    </div>
  );
}
