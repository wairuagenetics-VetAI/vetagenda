"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Syringe,
  Stethoscope,
  ClipboardList,
  Scan,
  Brain,
  Heart,
  Bone,
  Eye,
  Scissors,
  Pill,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  syringe: Syringe,
  stethoscope: Stethoscope,
  "clipboard-list": ClipboardList,
  scan: Scan,
  brain: Brain,
  heart: Heart,
  bone: Bone,
  eye: Eye,
  scissors: Scissors,
  pill: Pill,
};

interface ServicePickerProps {
  slug: string;
  services: Array<{
    id: string;
    name_public: string;
    description: string | null;
    icon: string | null;
    duration_minutes: number;
    allows_choose_professional: boolean;
  }>;
  centers: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export function ServicePicker({ slug, services, centers }: ServicePickerProps) {
  const router = useRouter();
  const [selectedCenter, setSelectedCenter] = useState(centers[0]?.id || "");

  function handleServiceClick(serviceId: string) {
    const params = new URLSearchParams({
      service: serviceId,
      center: selectedCenter,
    });
    router.push(`/${slug}/book/slots?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${slug}`}>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Reservar Cita</h1>
      </div>

      {/* Selector de centro (si hay más de uno) */}
      {centers.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Centro</p>
          <div className="flex flex-wrap gap-2">
            {centers.map((center) => (
              <button
                key={center.id}
                onClick={() => setSelectedCenter(center.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCenter === center.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:border-accent"
                }`}
              >
                {center.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Título */}
      <h2 className="text-lg font-semibold">¿Qué necesitas?</h2>

      {/* Lista de servicios */}
      <div className="space-y-3">
        {services.map((service) => {
          const IconComponent = ICON_MAP[service.icon || ""] || Stethoscope;

          return (
            <button
              key={service.id}
              onClick={() => handleServiceClick(service.id)}
              className="w-full text-left rounded-xl border border-border bg-card p-4 hover:border-accent hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{service.name_public}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {service.duration_minutes} min
                    </span>
                  </div>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Link al triaje */}
      <div className="text-center pt-2">
        <button className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
          <HelpCircle className="w-4 h-4" />
          ¿No sabes cuál elegir?
        </button>
      </div>
    </div>
  );
}
