-- VetAgenda - Schema inicial
-- Todas las tablas del sistema de agendamiento veterinario multi-tenant

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  brand_color TEXT DEFAULT '#0F2B46',
  accent_color TEXT DEFAULT '#4DA8DA',
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  emergency_message TEXT,
  timezone TEXT DEFAULT 'Europe/Madrid',
  privacy_policy_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX idx_organizations_slug ON organizations(slug);

CREATE TABLE centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('consult_room', 'surgery_room', 'imaging', 'other')),
  slot_minutes INT DEFAULT 30,
  is_active_default BOOLEAN DEFAULT true,
  color TEXT DEFAULT '#4DA8DA',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE resource_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  date_start DATE NOT NULL,
  date_end DATE NOT NULL,
  is_active BOOLEAN NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (date_end >= date_start)
);

CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  role_tag TEXT DEFAULT 'vet' CHECK (role_tag IN ('vet', 'atv', 'admin')),
  color TEXT DEFAULT '#1A4A7A',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE professional_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  UNIQUE(professional_id, center_id)
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name_public TEXT NOT NULL,
  name_internal TEXT,
  description TEXT,
  icon TEXT DEFAULT 'stethoscope',
  duration_minutes INT NOT NULL DEFAULT 30,
  resource_type_required TEXT NOT NULL DEFAULT 'consult_room',
  allows_choose_professional BOOLEAN DEFAULT true,
  default_professional_strategy TEXT DEFAULT 'any_available'
    CHECK (default_professional_strategy IN ('any_available', 'round_robin', 'least_loaded')),
  requires_manual_confirmation BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE service_professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  UNIQUE(service_id, professional_id)
);

CREATE TABLE schedule_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  label TEXT,
  CHECK (end_time > start_time)
);

CREATE TABLE schedule_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT true,
  custom_start TIME,
  custom_end TIME,
  note TEXT,
  UNIQUE(center_id, date)
);

CREATE TABLE reason_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  center_id UUID NOT NULL REFERENCES centers(id),
  resource_id UUID NOT NULL REFERENCES resources(id),
  professional_id UUID REFERENCES professionals(id),
  service_id UUID NOT NULL REFERENCES services(id),
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('pending', 'booked', 'cancelled', 'no_show', 'completed')),
  created_by TEXT NOT NULL DEFAULT 'guest' CHECK (created_by IN ('guest', 'staff')),
  created_by_staff_id UUID REFERENCES professionals(id),
  guest_owner_name TEXT,
  guest_pet_name TEXT NOT NULL,
  guest_pet_species TEXT DEFAULT 'dog' CHECK (guest_pet_species IN ('dog', 'cat', 'bird', 'rabbit', 'reptile', 'exotic', 'other')),
  guest_phone TEXT NOT NULL,
  guest_microchip TEXT,
  reason_category_id UUID REFERENCES reason_categories(id),
  reason_text TEXT,
  triage_summary TEXT,
  triage_urgency TEXT CHECK (triage_urgency IN ('low', 'normal', 'high', 'emergency')),
  triage_raw_json JSONB,
  consent_privacy BOOLEAN NOT NULL DEFAULT false,
  consent_data_accuracy BOOLEAN NOT NULL DEFAULT false,
  staff_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CHECK (end_ts > start_ts)
);

CREATE INDEX idx_appointments_center_time ON appointments(center_id, start_ts, end_ts);
CREATE INDEX idx_appointments_resource_time ON appointments(resource_id, start_ts, end_ts);
CREATE INDEX idx_appointments_professional_time ON appointments(professional_id, start_ts, end_ts);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_date ON appointments(start_ts);

CREATE TABLE appointment_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT,
  duration_seconds INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES centers(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id),
  professional_id UUID REFERENCES professionals(id),
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL DEFAULT 'blocked' CHECK (type IN ('blocked', 'surgery', 'meeting', 'break', 'reserved_urgent')),
  note TEXT,
  created_by UUID REFERENCES professionals(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (end_ts > start_ts)
);

CREATE INDEX idx_blocks_center_time ON blocks(center_id, start_ts, end_ts);
CREATE INDEX idx_blocks_resource_time ON blocks(resource_id, start_ts, end_ts);

CREATE TABLE staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'manager', 'staff', 'viewer')),
  UNIQUE(professional_id, organization_id)
);
