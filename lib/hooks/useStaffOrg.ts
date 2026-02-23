"use client";

// Hook para obtener la organización del staff logueado
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface StaffOrg {
  organizationId: string;
  professionalId: string;
  role: string;
  loading: boolean;
}

export function useStaffOrg(): StaffOrg {
  const [data, setData] = useState<StaffOrg>({
    organizationId: "",
    professionalId: "",
    role: "",
    loading: true,
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setData((d) => ({ ...d, loading: false }));
        return;
      }

      const { data: prof } = await supabase
        .from("professionals")
        .select("id, organization_id")
        .eq("user_id", user.id)
        .single();

      if (!prof) {
        setData((d) => ({ ...d, loading: false }));
        return;
      }

      const { data: role } = await supabase
        .from("staff_roles")
        .select("role")
        .eq("professional_id", prof.id)
        .single();

      setData({
        organizationId: prof.organization_id,
        professionalId: prof.id,
        role: role?.role || "staff",
        loading: false,
      });
    }

    load();
  }, []);

  return data;
}
