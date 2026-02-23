-- VetAgenda - Datos de prueba (Seed)
-- Clínica demo: "Clínica Veterinaria Wairua"

-- 1) Organización
INSERT INTO organizations (id, name, slug, brand_color, accent_color, description, contact_phone, contact_email, emergency_message, timezone)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Clínica Veterinaria Wairua',
  'wairua',
  '#0F2B46',
  '#4DA8DA',
  'Tu clínica veterinaria de confianza. Cuidamos de tus mascotas como si fueran nuestras.',
  '+34 912 345 678',
  'info@wairua.vet',
  'Urgencias 24h: llama al +34 912 345 999',
  'Europe/Madrid'
);

-- 2) Centro
INSERT INTO centers (id, organization_id, name, slug, address, phone)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Sede Central',
  'sede-central',
  'Calle Mayor 42, 28013 Madrid',
  '+34 912 345 678'
);

-- 3) Recursos (consultas y quirófano)
INSERT INTO resources (id, center_id, name, type, slot_minutes, is_active_default, color, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Consulta 1', 'consult_room', 30, true, '#4DA8DA', 0),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Consulta 2', 'consult_room', 30, true, '#22C55E', 1),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Quirófano', 'surgery_room', 60, true, '#EF4444', 2);

-- 4) Profesionales
INSERT INTO professionals (id, organization_id, display_name, role_tag, color, is_active) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Dra. María García', 'vet', '#1A4A7A', true),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Dr. Carlos López', 'vet', '#7C3AED', true),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Ana Martínez (ATV)', 'atv', '#F59E0B', true);

-- 5) Profesionales asignados al centro
INSERT INTO professional_centers (professional_id, center_id) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001'),
  ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001');

-- 6) Servicios
INSERT INTO services (id, organization_id, name_public, name_internal, description, icon, duration_minutes, resource_type_required, allows_choose_professional, requires_manual_confirmation, sort_order) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Consulta general', 'consulta_general', 'Revisión general de salud de tu mascota', 'stethoscope', 30, 'consult_room', true, false, 0),
  ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Vacunación', 'vacunacion', 'Vacunas y desparasitación', 'syringe', 20, 'consult_room', true, false, 1),
  ('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Cirugía programada', 'cirugia', 'Intervención quirúrgica programada', 'scissors', 60, 'surgery_room', true, true, 2),
  ('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Urgencia', 'urgencia', 'Atención de urgencia veterinaria', 'alert-triangle', 30, 'consult_room', false, false, 3),
  ('e0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Peluquería canina', 'peluqueria', 'Baño, corte y cuidado estético', 'sparkles', 45, 'consult_room', false, false, 4);

-- 7) Profesionales que ofrecen cada servicio
INSERT INTO service_professionals (service_id, professional_id) VALUES
  -- Consulta general: todos los vets
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002'),
  -- Vacunación: todos los vets + ATV
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003'),
  -- Cirugía: solo vets
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000002'),
  -- Urgencia: vets
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002'),
  -- Peluquería: ATV
  ('e0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003');

-- 8) Horario semanal (lunes a viernes 9-14 y 16-20, sábado 10-14)
-- Lunes (1)
INSERT INTO schedule_rules (center_id, day_of_week, start_time, end_time, is_active, label) VALUES
  ('b0000000-0000-0000-0000-000000000001', 1, '09:00', '14:00', true, 'Mañana'),
  ('b0000000-0000-0000-0000-000000000001', 1, '16:00', '20:00', true, 'Tarde');
-- Martes (2)
INSERT INTO schedule_rules (center_id, day_of_week, start_time, end_time, is_active, label) VALUES
  ('b0000000-0000-0000-0000-000000000001', 2, '09:00', '14:00', true, 'Mañana'),
  ('b0000000-0000-0000-0000-000000000001', 2, '16:00', '20:00', true, 'Tarde');
-- Miércoles (3)
INSERT INTO schedule_rules (center_id, day_of_week, start_time, end_time, is_active, label) VALUES
  ('b0000000-0000-0000-0000-000000000001', 3, '09:00', '14:00', true, 'Mañana'),
  ('b0000000-0000-0000-0000-000000000001', 3, '16:00', '20:00', true, 'Tarde');
-- Jueves (4)
INSERT INTO schedule_rules (center_id, day_of_week, start_time, end_time, is_active, label) VALUES
  ('b0000000-0000-0000-0000-000000000001', 4, '09:00', '14:00', true, 'Mañana'),
  ('b0000000-0000-0000-0000-000000000001', 4, '16:00', '20:00', true, 'Tarde');
-- Viernes (5)
INSERT INTO schedule_rules (center_id, day_of_week, start_time, end_time, is_active, label) VALUES
  ('b0000000-0000-0000-0000-000000000001', 5, '09:00', '14:00', true, 'Mañana'),
  ('b0000000-0000-0000-0000-000000000001', 5, '16:00', '20:00', true, 'Tarde');
-- Sábado (6)
INSERT INTO schedule_rules (center_id, day_of_week, start_time, end_time, is_active, label) VALUES
  ('b0000000-0000-0000-0000-000000000001', 6, '10:00', '14:00', true, 'Mañana');
-- Domingo (0): cerrado (sin reglas)

-- 9) Categorías de motivo de consulta
INSERT INTO reason_categories (id, organization_id, name, sort_order, is_active) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Revisión rutinaria', 0, true),
  ('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Mi mascota está enferma', 1, true),
  ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Vacunación / Desparasitación', 2, true),
  ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Problema de piel / Alergias', 3, true),
  ('f0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Problema digestivo', 4, true),
  ('f0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Cojera / Problema locomotor', 5, true),
  ('f0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Segunda opinión', 6, true),
  ('f0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Otro motivo', 7, true);
