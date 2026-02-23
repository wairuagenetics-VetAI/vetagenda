"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  CalendarRange,
  Settings,
  LogOut,
  Menu,
  X,
  PawPrint,
  Users,
  Stethoscope,
  Clock,
  Building2,
  Palette,
  ListChecks,
  DoorOpen,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

// Navegación principal del staff
const NAV_ITEMS = [
  { href: "/staff/dashboard", label: "Agenda del día", icon: CalendarDays },
  { href: "/staff/week", label: "Vista semanal", icon: CalendarRange },
  { href: "/staff/appointments", label: "Citas", icon: ListChecks },
  { href: "/staff/blocks", label: "Bloqueos", icon: Lock },
];

// Navegación de administración
const ADMIN_ITEMS = [
  { href: "/staff/admin/centers", label: "Centros", icon: Building2 },
  { href: "/staff/admin/resources", label: "Consultas", icon: DoorOpen },
  { href: "/staff/admin/professionals", label: "Profesionales", icon: Users },
  { href: "/staff/admin/services", label: "Servicios", icon: Stethoscope },
  { href: "/staff/admin/schedule", label: "Horarios", icon: Clock },
  { href: "/staff/admin/reasons", label: "Motivos", icon: ListChecks },
  { href: "/staff/admin/branding", label: "Personalización", icon: Palette },
];

interface StaffShellProps {
  children: React.ReactNode;
  staffName?: string;
  orgName?: string;
}

export function StaffShell({ children, staffName, orgName }: StaffShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/staff/login");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <PawPrint className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-sidebar-foreground truncate">
            {orgName || "VetAgenda"}
          </p>
          {staffName && (
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {staffName}
            </p>
          )}
        </div>
      </div>

      {/* Nav principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
          Agenda
        </p>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}

        <div className="pt-4">
          <p className="px-3 pb-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            Administración
          </p>
          {ADMIN_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header mobile */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-card border-b border-border px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-sm font-semibold">
            {orgName || "VetAgenda"}
          </span>
          <div className="w-9" /> {/* Spacer para centrar el título */}
        </header>

        {/* Contenido de la página */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
