-- VetAgenda - Funciones RPC
-- Función atómica para reservar cita (previene doble-reserva)

CREATE OR REPLACE FUNCTION rpc_book_appointment(
  p_center_id UUID,
  p_service_id UUID,
  p_start_ts TIMESTAMPTZ,
  p_professional_id UUID DEFAULT NULL,
  p_guest_pet_name TEXT DEFAULT '',
  p_guest_pet_species TEXT DEFAULT 'dog',
  p_guest_phone TEXT DEFAULT '',
  p_guest_owner_name TEXT DEFAULT NULL,
  p_guest_microchip TEXT DEFAULT NULL,
  p_reason_category_id UUID DEFAULT NULL,
  p_reason_text TEXT DEFAULT NULL,
  p_consent_privacy BOOLEAN DEFAULT false,
  p_consent_data_accuracy BOOLEAN DEFAULT false,
  p_triage_summary TEXT DEFAULT NULL,
  p_triage_urgency TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_service RECORD;
  v_end_ts TIMESTAMPTZ;
  v_resource_id UUID;
  v_professional_id UUID;
  v_org_id UUID;
  v_appointment_id UUID;
  v_status TEXT;
BEGIN
  -- 1) Validar consentimientos
  IF NOT p_consent_privacy OR NOT p_consent_data_accuracy THEN
    RAISE EXCEPTION 'Consentimientos obligatorios no aceptados';
  END IF;

  -- 2) Cargar servicio
  SELECT * INTO v_service FROM services WHERE id = p_service_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Servicio no encontrado o inactivo';
  END IF;

  -- 3) Obtener organization_id
  SELECT organization_id INTO v_org_id FROM centers WHERE id = p_center_id;
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Centro no encontrado';
  END IF;

  -- 4) Calcular end_ts
  v_end_ts := p_start_ts + (v_service.duration_minutes || ' minutes')::INTERVAL;

  -- 5) Determinar estado
  IF v_service.requires_manual_confirmation THEN
    v_status := 'pending';
  ELSE
    v_status := 'booked';
  END IF;

  -- 6) Buscar recurso libre (con bloqueo FOR UPDATE)
  SELECT r.id INTO v_resource_id
  FROM resources r
  WHERE r.center_id = p_center_id
    AND r.type = v_service.resource_type_required
    AND (
      COALESCE(
        (SELECT ro.is_active FROM resource_overrides ro
         WHERE ro.resource_id = r.id
         AND p_start_ts::DATE BETWEEN ro.date_start AND ro.date_end
         ORDER BY ro.created_at DESC LIMIT 1),
        r.is_active_default
      ) = true
    )
    AND NOT EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.resource_id = r.id
        AND a.status NOT IN ('cancelled')
        AND a.start_ts < v_end_ts
        AND a.end_ts > p_start_ts
    )
    AND NOT EXISTS (
      SELECT 1 FROM blocks b
      WHERE (b.resource_id = r.id OR (b.resource_id IS NULL AND b.center_id = p_center_id))
        AND b.start_ts < v_end_ts
        AND b.end_ts > p_start_ts
    )
  ORDER BY r.sort_order
  LIMIT 1
  FOR UPDATE OF r;

  IF v_resource_id IS NULL THEN
    RAISE EXCEPTION 'No hay consultas disponibles en ese horario';
  END IF;

  -- 7) Asignar profesional
  IF p_professional_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.professional_id = p_professional_id
        AND a.status NOT IN ('cancelled')
        AND a.start_ts < v_end_ts AND a.end_ts > p_start_ts
    ) OR EXISTS (
      SELECT 1 FROM blocks b
      WHERE b.professional_id = p_professional_id
        AND b.start_ts < v_end_ts AND b.end_ts > p_start_ts
    ) THEN
      RAISE EXCEPTION 'El profesional seleccionado no está disponible en ese horario';
    END IF;
    v_professional_id := p_professional_id;
  ELSE
    SELECT sp.professional_id INTO v_professional_id
    FROM service_professionals sp
    JOIN professional_centers pc ON pc.professional_id = sp.professional_id
    JOIN professionals pr ON pr.id = sp.professional_id
    WHERE sp.service_id = p_service_id
      AND pc.center_id = p_center_id
      AND pr.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM appointments a
        WHERE a.professional_id = sp.professional_id
          AND a.status NOT IN ('cancelled')
          AND a.start_ts < v_end_ts AND a.end_ts > p_start_ts
      )
      AND NOT EXISTS (
        SELECT 1 FROM blocks b
        WHERE b.professional_id = sp.professional_id
          AND b.start_ts < v_end_ts AND b.end_ts > p_start_ts
      )
    LIMIT 1;
  END IF;

  -- 8) Insertar cita
  INSERT INTO appointments (
    organization_id, center_id, resource_id, professional_id, service_id,
    start_ts, end_ts, status, created_by,
    guest_pet_name, guest_pet_species, guest_phone, guest_owner_name, guest_microchip,
    reason_category_id, reason_text,
    consent_privacy, consent_data_accuracy,
    triage_summary, triage_urgency
  ) VALUES (
    v_org_id, p_center_id, v_resource_id, v_professional_id, p_service_id,
    p_start_ts, v_end_ts, v_status, 'guest',
    p_guest_pet_name, p_guest_pet_species, p_guest_phone, p_guest_owner_name, p_guest_microchip,
    p_reason_category_id, p_reason_text,
    p_consent_privacy, p_consent_data_accuracy,
    p_triage_summary, p_triage_urgency
  )
  RETURNING id INTO v_appointment_id;

  RETURN v_appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
