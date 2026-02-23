"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { bookingFormSchema, type BookingFormData } from "@/lib/utils/validators";
import { normalizePhone } from "@/lib/utils/phone";
import { PET_SPECIES } from "@/lib/constants";
import { toast } from "sonner";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

export default function DetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service") || "";
  const centerId = searchParams.get("center") || "";
  const dateStr = searchParams.get("date") || "";
  const timeStr = searchParams.get("time") || "";
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [reasonCategories, setReasonCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Cargar servicio y motivos de consulta
  useEffect(() => {
    const supabase = createClient();

    if (serviceId) {
      supabase
        .from("services")
        .select("name_public, organization_id")
        .eq("id", serviceId)
        .single()
        .then(({ data }) => {
          if (data) {
            setServiceName(data.name_public);
            supabase
              .from("reason_categories")
              .select("id, name")
              .eq("organization_id", data.organization_id)
              .eq("is_active", true)
              .order("sort_order")
              .then(({ data: reasons }) => {
                setReasonCategories(reasons || []);
              });
          }
        });
    }
  }, [serviceId]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guest_pet_name: "",
      guest_pet_species: "dog",
      guest_phone: "",
      guest_owner_name: "",
      guest_microchip: "",
      reason_category_id: "",
      reason_text: "",
      consent_privacy: false,
      consent_data_accuracy: false,
    },
  });

  const displayDate = dateStr
    ? format(
        parse(dateStr, "yyyy-MM-dd", new Date()),
        "EEEE d 'de' MMMM",
        { locale: es }
      )
    : "";

  async function onSubmit(data: BookingFormData) {
    setSubmitting(true);

    try {
      const supabase = createClient();
      const startTs = `${dateStr}T${timeStr}:00`;

      const { data: result, error } = await supabase.functions.invoke("book", {
        body: {
          center_id: centerId,
          service_id: serviceId,
          start_ts: startTs,
          guest_pet_name: data.guest_pet_name,
          guest_pet_species: data.guest_pet_species,
          guest_phone: normalizePhone(data.guest_phone),
          guest_owner_name: data.guest_owner_name || null,
          guest_microchip: data.guest_microchip || null,
          reason_category_id: data.reason_category_id || null,
          reason_text: data.reason_text || null,
          consent_privacy: data.consent_privacy,
          consent_data_accuracy: data.consent_data_accuracy,
        },
      });

      if (error) {
        toast.error(error.message || "Error al reservar la cita");
        return;
      }

      const confirmParams = new URLSearchParams({
        id: result.appointment_id || result.id || "",
        pet: data.guest_pet_name,
        service: serviceName,
        date: dateStr,
        time: timeStr,
      });
      router.push(`/${slug}/book/confirmation?${confirmParams.toString()}`);
    } catch {
      toast.error("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={
            slug
              ? `/${slug}/book/slots?service=${serviceId}&center=${centerId}`
              : "#"
          }
        >
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Tus datos</h1>
      </div>

      {/* Resumen de la cita */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-accent/10 p-3 text-sm">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
          <span className="capitalize">{displayDate}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-accent flex-shrink-0" />
          <span>{timeStr}</span>
        </div>
        {serviceName && (
          <span className="text-muted-foreground">· {serviceName}</span>
        )}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre de la mascota */}
        <div className="space-y-1.5">
          <Label htmlFor="guest_pet_name">Nombre de la mascota *</Label>
          <Input
            id="guest_pet_name"
            placeholder="Ej: Luna"
            {...register("guest_pet_name")}
            className="rounded-lg"
          />
          {errors.guest_pet_name && (
            <p className="text-sm text-destructive">
              {errors.guest_pet_name.message}
            </p>
          )}
        </div>

        {/* Especie */}
        <div className="space-y-1.5">
          <Label>Especie *</Label>
          <Select
            defaultValue="dog"
            onValueChange={(val) =>
              setValue(
                "guest_pet_species",
                val as BookingFormData["guest_pet_species"]
              )
            }
          >
            <SelectTrigger className="rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PET_SPECIES.map((species) => (
                <SelectItem key={species.value} value={species.value}>
                  {species.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teléfono */}
        <div className="space-y-1.5">
          <Label htmlFor="guest_phone">Teléfono de contacto *</Label>
          <Input
            id="guest_phone"
            type="tel"
            placeholder="600 123 456"
            {...register("guest_phone")}
            className="rounded-lg"
          />
          {errors.guest_phone && (
            <p className="text-sm text-destructive">
              {errors.guest_phone.message}
            </p>
          )}
        </div>

        {/* Microchip */}
        <div className="space-y-1.5">
          <Label htmlFor="guest_microchip">Microchip (opcional)</Label>
          <Input
            id="guest_microchip"
            placeholder="Ej: 941000012345678"
            {...register("guest_microchip")}
            className="rounded-lg"
          />
        </div>

        {/* Nombre del propietario */}
        <div className="space-y-1.5">
          <Label htmlFor="guest_owner_name">
            Nombre del propietario (opcional)
          </Label>
          <Input
            id="guest_owner_name"
            placeholder="Ej: María García"
            {...register("guest_owner_name")}
            className="rounded-lg"
          />
        </div>

        {/* Motivo de consulta */}
        {reasonCategories.length > 0 && (
          <div className="space-y-1.5">
            <Label>Motivo de consulta</Label>
            <Select
              onValueChange={(val) => setValue("reason_category_id", val)}
            >
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {reasonCategories.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id}>
                    {reason.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Descripción adicional */}
        <div className="space-y-1.5">
          <Label htmlFor="reason_text">Cuéntanos un poco más (opcional)</Label>
          <Textarea
            id="reason_text"
            placeholder="Describe brevemente el motivo de la consulta..."
            rows={3}
            {...register("reason_text")}
            className="rounded-lg resize-none"
          />
        </div>

        {/* Consentimientos */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2">
            <Checkbox
              id="consent_privacy"
              checked={watch("consent_privacy")}
              onCheckedChange={(checked) =>
                setValue("consent_privacy", checked === true)
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="consent_privacy"
              className="text-sm font-normal leading-snug cursor-pointer"
            >
              Acepto la política de privacidad *
            </Label>
          </div>
          {errors.consent_privacy && (
            <p className="text-sm text-destructive">
              {errors.consent_privacy.message}
            </p>
          )}

          <div className="flex items-start gap-2">
            <Checkbox
              id="consent_data_accuracy"
              checked={watch("consent_data_accuracy")}
              onCheckedChange={(checked) =>
                setValue("consent_data_accuracy", checked === true)
              }
              className="mt-0.5"
            />
            <Label
              htmlFor="consent_data_accuracy"
              className="text-sm font-normal leading-snug cursor-pointer"
            >
              Confirmo que los datos proporcionados son correctos *
            </Label>
          </div>
          {errors.consent_data_accuracy && (
            <p className="text-sm text-destructive">
              {errors.consent_data_accuracy.message}
            </p>
          )}
        </div>

        {/* Botón confirmar */}
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-xl"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Reservando...
            </>
          ) : (
            "Confirmar Cita"
          )}
        </Button>
      </form>
    </div>
  );
}
