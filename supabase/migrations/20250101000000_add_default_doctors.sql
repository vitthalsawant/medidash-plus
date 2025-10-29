-- Add default doctors for the system
-- This migration adds some default doctors that can be used for appointments

-- First, create a system user for default doctors
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'system@hospital.com',
  crypt('system_password', gen_salt('bf')),
  NOW(),
  NULL,
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "System User"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Add default doctors
INSERT INTO public.doctors (
  id,
  user_id,
  full_name,
  email,
  phone,
  specialization,
  qualification,
  experience_years,
  consultation_fee,
  available_days,
  available_hours,
  created_at,
  updated_at
) VALUES 
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'Dr. Sarah Johnson',
    'sarah.johnson@hospital.com',
    '+1234567890',
    'Cardiology',
    'MD, Cardiology',
    10,
    150.00,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    '9:00 AM - 5:00 PM',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    'Dr. Michael Chen',
    'michael.chen@hospital.com',
    '+1234567891',
    'Neurology',
    'MD, Neurology',
    8,
    140.00,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    '9:00 AM - 5:00 PM',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000001',
    'Dr. Emily Rodriguez',
    'emily.rodriguez@hospital.com',
    '+1234567892',
    'Pediatrics',
    'MD, Pediatrics',
    12,
    120.00,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    '9:00 AM - 5:00 PM',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000001',
    'Dr. James Wilson',
    'james.wilson@hospital.com',
    '+1234567893',
    'Orthopedics',
    'MD, Orthopedics',
    15,
    160.00,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    '9:00 AM - 5:00 PM',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000001',
    'Dr. Priya Patel',
    'priya.patel@hospital.com',
    '+1234567894',
    'Dermatology',
    'MD, Dermatology',
    7,
    130.00,
    ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    '9:00 AM - 5:00 PM',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Add role for the system user
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'doctor', NOW())
ON CONFLICT (user_id, role) DO NOTHING;
