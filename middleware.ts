import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Proteger todas las rutas /staff excepto /staff/login y assets estáticos
    "/staff/((?!login|_next/static|_next/image|favicon.ico).*)",
  ],
};
