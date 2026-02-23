"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PawPrint, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Credenciales incorrectas");
        return;
      }

      router.push("/staff/dashboard");
      router.refresh();
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground">
              <PawPrint className="w-7 h-7" />
            </div>
          </div>
          <h1 className="text-xl font-bold">VetAgenda</h1>
          <p className="text-sm text-muted-foreground">Panel de gestión</p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleLogin}
          className="space-y-4 rounded-xl border border-border bg-card p-6"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@clinica.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-lg"
            />
          </div>

          <Button
            type="submit"
            className="w-full rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Entrando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}
