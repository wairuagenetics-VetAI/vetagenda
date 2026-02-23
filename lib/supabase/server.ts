// Cliente Supabase para Server Components y API Routes
// NOTA: Cuando conectes a Supabase, genera los tipos con:
//   npx supabase gen types typescript --project-id <id> > lib/types/database.ts
// y descomenta el genérico <Database> para obtener tipado completo.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // En Server Components no se pueden setear cookies,
            // esto se maneja en middleware
          }
        },
      },
    }
  );
}

// Cliente con service role para operaciones administrativas
export function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
