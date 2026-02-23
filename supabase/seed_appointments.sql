-- VetAgenda - Citas de ejemplo
-- Citas para hoy y próximos días

-- Hoy: 3 citas
INSERT INTO appointments (
  organization_id, center_id, resource_id, professional_id, service_id,
  start_ts, end_ts, status, created_by,
  guest_pet_name, guest_pet_species, guest_phone, guest_owner_name,
  reason_text, consent_privacy, consent_data_accuracy
) VALUES
-- Cita 1: Hoy 09:00 - Consulta general - Booked
(
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  (CURRENT_DATE + TIME '09:00')::timestamptz,
  (CURRENT_DATE + TIME '09:30')::timestamptz,
  'booked', 'guest',
  'Luna', 'dog', '+34611222333', 'Pedro Sánchez',
  'Revisión anual y vacunas', true, true
),
-- Cita 2: Hoy 10:00 - Vacunación - Confirmed/Booked
(
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000002',
  'e0000000-0000-0000-0000-000000000002',
  (CURRENT_DATE + TIME '10:00')::timestamptz,
  (CURRENT_DATE + TIME '10:20')::timestamptz,
  'booked', 'guest',
  'Mishi', 'cat', '+34622333444', 'Laura Fernández',
  'Vacuna trivalente felina', true, true
),
-- Cita 3: Hoy 11:30 - Consulta general - Pending
(
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  (CURRENT_DATE + TIME '11:30')::timestamptz,
  (CURRENT_DATE + TIME '12:00')::timestamptz,
  'pending', 'guest',
  'Rocky', 'dog', '+34633444555', 'Juan Martín',
  'Cojea de la pata trasera derecha', true, true
),
-- Cita 4: Hoy 16:30 - Peluquería - Booked
(
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000003',
  'e0000000-0000-0000-0000-000000000005',
  (CURRENT_DATE + TIME '16:30')::timestamptz,
  (CURRENT_DATE + TIME '17:15')::timestamptz,
  'booked', 'guest',
  'Coco', 'dog', '+34644555666', 'María López',
  'Baño y corte completo', true, true
),
-- Cita 5: Hoy 17:00 - Urgencia - Booked
(
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000002',
  'e0000000-0000-0000-0000-000000000004',
  (CURRENT_DATE + TIME '17:00')::timestamptz,
  (CURRENT_DATE + TIME '17:30')::timestamptz,
  'booked', 'guest',
  'Nala', 'cat', '+34655666777', 'Ana García',
  'Vomita desde ayer, no come', true, true
),

-- Mañana: 2 citas
-- Cita 6: Mañana 09:30 - Consulta - Booked
(
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  (CURRENT_DATE + INTERVAL '1 day' + TIME '09:30')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 day' + TIME '10:00')::timestamptz,
  'booked', 'guest',
  'Max', 'dog', '+34666777888', 'Roberto Díaz',
  'Revisión post-operatoria', true, true
),
-- Cita 7: Mañana 12:00 - Vacunación - Pending
(
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000002',
  'e0000000-0000-0000-0000-000000000002',
  (CURRENT_DATE + INTERVAL '1 day' + TIME '12:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 day' + TIME '12:20')::timestamptz,
  'pending', 'guest',
  'Kira', 'dog', '+34677888999', 'Elena Torres',
  'Primera vacuna cachorro 3 meses', true, true
),

-- Pasado mañana: 1 cita completada (ejemplo)
(
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  (CURRENT_DATE - INTERVAL '1 day' + TIME '10:00')::timestamptz,
  (CURRENT_DATE - INTERVAL '1 day' + TIME '10:30')::timestamptz,
  'completed', 'guest',
  'Toby', 'rabbit', '+34688999000', 'Carmen Ruiz',
  'Revisión dental conejo', true, true
);

-- Un bloqueo de ejemplo: cirugía mañana por la tarde
INSERT INTO blocks (center_id, resource_id, professional_id, start_ts, end_ts, type, note, created_by)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000003',
  'd0000000-0000-0000-0000-000000000001',
  (CURRENT_DATE + INTERVAL '1 day' + TIME '16:00')::timestamptz,
  (CURRENT_DATE + INTERVAL '1 day' + TIME '18:00')::timestamptz,
  'surgery',
  'Esterilización perra - Max (Roberto Díaz)',
  'd0000000-0000-0000-0000-000000000001'
);
