-- Update appointments table for approval workflow
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add appointment status enum
DO $$ BEGIN
  CREATE TYPE public.appointment_status AS ENUM (
    'pending',
    'approved', 
    'confirmed',
    'completed',
    'cancelled',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop default before type change
ALTER TABLE public.appointments ALTER COLUMN status DROP DEFAULT;

-- Modify appointments table to use the enum
ALTER TABLE public.appointments 
ALTER COLUMN status TYPE appointment_status USING 
  CASE 
    WHEN status = 'scheduled' THEN 'pending'::appointment_status
    WHEN status = 'completed' THEN 'completed'::appointment_status
    WHEN status = 'cancelled' THEN 'cancelled'::appointment_status
    ELSE 'pending'::appointment_status
  END;

-- Set new default
ALTER TABLE public.appointments 
ALTER COLUMN status SET DEFAULT 'pending'::appointment_status;

-- Add approved_by and approved_at columns
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

-- Update RLS policies for appointment booking workflow

-- Drop existing policies
DROP POLICY IF EXISTS "Patients can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctors can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Receptionists can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update appointments" ON public.appointments;

-- Patients can create their own appointments
CREATE POLICY "Patients can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM patients 
    WHERE patients.id = appointments.patient_id 
    AND patients.user_id = auth.uid()
  )
);

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments" 
ON public.appointments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM patients 
    WHERE patients.id = appointments.patient_id 
    AND patients.user_id = auth.uid()
  )
);

-- Doctors can view their appointments
CREATE POLICY "Doctors can view their appointments" 
ON public.appointments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM doctors 
    WHERE doctors.id = appointments.doctor_id 
    AND doctors.user_id = auth.uid()
  )
);

-- Receptionists, admins, and doctors can view all appointments
CREATE POLICY "Staff can view all appointments" 
ON public.appointments 
FOR SELECT 
USING (
  has_role(auth.uid(), 'receptionist'::app_role) 
  OR has_role(auth.uid(), 'nurse'::app_role) 
  OR has_role(auth.uid(), 'doctor'::app_role)
  OR is_admin(auth.uid())
);

-- Receptionists, doctors, admins can approve/update appointments
CREATE POLICY "Staff can update appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  has_role(auth.uid(), 'receptionist'::app_role) 
  OR has_role(auth.uid(), 'doctor'::app_role)
  OR is_admin(auth.uid())
);

-- Make doctors table publicly readable for appointment booking
DROP POLICY IF EXISTS "Everyone can view doctors" ON public.doctors;
DROP POLICY IF EXISTS "Public can view doctors" ON public.doctors;

CREATE POLICY "Public can view doctors" 
ON public.doctors 
FOR SELECT 
USING (true);

-- Update patients RLS policies
DROP POLICY IF EXISTS "Admins and receptionists can insert patients" ON public.patients;
DROP POLICY IF EXISTS "Users can create own patient record" ON public.patients;

-- Allow receptionists and admins to insert patients
CREATE POLICY "Admins and receptionists can insert patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  is_admin(auth.uid()) 
  OR has_role(auth.uid(), 'receptionist'::app_role)
);

-- Users can create their own patient record
CREATE POLICY "Users can create own patient record" 
ON public.patients 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);