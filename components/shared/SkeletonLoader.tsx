import { Skeleton } from "@/components/ui/skeleton";

// Skeleton para tarjetas de servicio
export function ServiceCardSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
    </div>
  );
}

// Skeleton para slots de hora
export function SlotGridSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-20" />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// Skeleton para tarjeta de cita en panel staff
export function AppointmentCardSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

// Skeleton para calendario
export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 w-full" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`d-${i}`} className="h-8 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
