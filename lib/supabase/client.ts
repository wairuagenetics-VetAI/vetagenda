// Cliente Supabase para el navegador (usa anon key, seguro para el frontend)
// NOTA: Cuando conectes a Supabase, genera los tipos con:
//   npx supabase gen types typescript --project-id <id> > lib/types/database.ts
// y descomenta el genérico <Database> para obtener tipado completo.

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
