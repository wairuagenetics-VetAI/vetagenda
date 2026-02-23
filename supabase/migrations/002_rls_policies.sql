-- VetAgenda - Row Level Security Policies
-- Principio: cada clínica solo ve sus propios datos

-- Función helper para obtener el organization_id del usuario logueado
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT sr.organization_id
  FROM staff_roles sr
  JOIN professionals p ON p.id = sr.professional_id
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Función helper para obtener el rol del usuario
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT sr.role
  FROM staff_roles sr
  JOIN professionals p ON p.id = sr.professional_id
  WHERE p.user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============= ORGANIZATIONS =============
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Público puede leer organizaciones activas (para resolver slug)
CREATE POLICY "public_read_active_orgs" ON organizations
  FOR SELECT USING (is_active = true);

-- Staff solo modifica su propia organización
CREATE POLICY "staff_update_own_org" ON organizations
  FOR UPDATE USING (id = get_user_org_id());

-- ============= CENTERS =============
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;

-- Público puede leer centros activos
CREATE POLICY "public_read_active_centers" ON centers
  FOR SELECT USING (is_active = true);

-- Staff CRUD en su organización
CREATE POLICY "staff_all_own_centers" ON centers
  FOR ALL USING (organization_id = get_user_org_id());

-- ============= RESOURCES =============
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Público puede leer recursos (para disponibilidad)
CREATE POLICY "public_read_resources" ON resources
  FOR SELECT USING (true);

-- Staff CRUD
CREATE POLICY "staff_all_own_resources" ON resources
  FOR ALL USING (
    center_id IN (SELECT id FROM centers WHERE organization_id = get_user_org_id())
  );

-- ============= RESOURCE_OVERRIDES =============
ALTER TABLE resource_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_overrides" ON resource_overrides
  FOR SELECT USING (true);

CREATE POLICY "staff_all_own_overrides" ON resource_overrides
  FOR ALL USING (
    resource_id IN (
      SELECT r.id FROM resources r
      JOIN centers c ON c.id = r.center_id
      WHERE c.organization_id = get_user_org_id()
    )
  );

-- ============= PROFESSIONALS =============
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Público puede leer profesionales activos (para elegir veterinario)
CREATE POLICY "public_read_active_professionals" ON professionals
  FOR SELECT USING (is_active = true);

CREATE POLICY "staff_all_own_professionals" ON professionals
  FOR ALL USING (organization_id = get_user_org_id());

-- ============= PROFESSIONAL_CENTERS =============
ALTER TABLE professional_centers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_prof_centers" ON professional_centers
  FOR SELECT USING (true);

CREATE POLICY "staff_all_own_prof_centers" ON professional_centers
  FOR ALL USING (
    professional_id IN (SELECT id FROM professionals WHERE organization_id = get_user_org_id())
  );

-- ============= SERVICES =============
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Público puede leer servicios activos
CREATE POLICY "public_read_active_services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "staff_all_own_services" ON services
  FOR ALL USING (organization_id = get_user_org_id());

-- ============= SERVICE_PROFESSIONALS =============
ALTER TABLE service_professionals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_service_profs" ON service_professionals
  FOR SELECT USING (true);

CREATE POLICY "staff_all_own_service_profs" ON service_professionals
  FOR ALL USING (
    service_id IN (SELECT id FROM services WHERE organization_id = get_user_org_id())
  );

-- ============= SCHEDULE_RULES =============
ALTER TABLE schedule_rules ENABLE ROW LEVEL SECURITY;

-- Público puede leer horarios (para disponibilidad)
CREATE POLICY "public_read_schedule_rules" ON schedule_rules
  FOR SELECT USING (true);

CREATE POLICY "staff_all_own_schedule_rules" ON schedule_rules
  FOR ALL USING (
    center_id IN (SELECT id FROM centers WHERE organization_id = get_user_org_id())
  );

-- ============= SCHEDULE_EXCEPTIONS =============
ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_schedule_exceptions" ON schedule_exceptions
  FOR SELECT USING (true);

CREATE POLICY "staff_all_own_schedule_exceptions" ON schedule_exceptions
  FOR ALL USING (
    center_id IN (SELECT id FROM centers WHERE organization_id = get_user_org_id())
  );

-- ============= REASON_CATEGORIES =============
ALTER TABLE reason_categories ENABLE ROW LEVEL SECURITY;

-- Público puede leer motivos activos
CREATE POLICY "public_read_active_reasons" ON reason_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "staff_all_own_reasons" ON reason_categories
  FOR ALL USING (organization_id = get_user_org_id());

-- ============= APPOINTMENTS =============
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Staff solo ve citas de su organización
CREATE POLICY "staff_read_own_org_appointments" ON appointments
  FOR SELECT USING (organization_id = get_user_org_id());

CREATE POLICY "staff_insert_own_org_appointments" ON appointments
  FOR INSERT WITH CHECK (organization_id = get_user_org_id());

CREATE POLICY "staff_update_own_org_appointments" ON appointments
  FOR UPDATE USING (organization_id = get_user_org_id());

-- Público NO accede a appointments directamente (solo via Edge Functions/RPC)

-- ============= APPOINTMENT_ATTACHMENTS =============
ALTER TABLE appointment_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_all_own_attachments" ON appointment_attachments
  FOR ALL USING (
    appointment_id IN (SELECT id FROM appointments WHERE organization_id = get_user_org_id())
  );

-- ============= BLOCKS =============
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Público puede leer bloques (necesario para disponibilidad)
CREATE POLICY "public_read_blocks" ON blocks
  FOR SELECT USING (true);

CREATE POLICY "staff_all_own_blocks" ON blocks
  FOR ALL USING (
    center_id IN (SELECT id FROM centers WHERE organization_id = get_user_org_id())
  );

-- ============= STAFF_ROLES =============
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_read_own_roles" ON staff_roles
  FOR SELECT USING (organization_id = get_user_org_id());

-- Solo owner puede gestionar roles
CREATE POLICY "owner_manage_roles" ON staff_roles
  FOR ALL USING (
    organization_id = get_user_org_id()
    AND get_user_role() = 'owner'
  );
