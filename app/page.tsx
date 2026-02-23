import { PawPrint } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground">
            <PawPrint className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">VetAgenda</h1>
        <p className="text-muted-foreground">
          Introduce el enlace de tu clínica veterinaria para reservar tu cita.
        </p>
        <p className="text-sm text-muted-foreground">
          Ejemplo: vetagenda.com/tu-clinica
        </p>
      </div>
    </main>
  );
}
