-- CRITICAL FIX: Allow users to insert their own role during registration
CREATE POLICY "Users can insert their own role" ON public.user_roles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow patients to create their own patient record
CREATE POLICY "Users can create their own patient record" ON public.patients
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow patients to create their own appointments
CREATE POLICY "Patients can create their own appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients 
      WHERE id = appointments.patient_id 
      AND user_id = auth.uid()
    )
  );

