-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM (
  'super_admin',
  'admin', 
  'doctor',
  'patient',
  'nurse',
  'receptionist'
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  blood_group TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT,
  allergies TEXT,
  current_medications TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialization TEXT NOT NULL,
  qualification TEXT NOT NULL,
  experience_years INTEGER,
  consultation_fee DECIMAL(10,2),
  available_days TEXT[], -- Array of days like ['monday', 'tuesday']
  available_hours TEXT, -- e.g., "9:00 AM - 5:00 PM"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create medical_records table
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  diagnosis TEXT NOT NULL,
  symptoms TEXT,
  treatment TEXT,
  notes TEXT,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE SET NULL,
  medications JSONB NOT NULL, -- Array of {name, dosage, frequency, duration}
  instructions TEXT,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('prescription', 'lab_report', 'scan', 'xray', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin')
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for patients
CREATE POLICY "Patients can view own record" ON public.patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Medical staff can view all patients" ON public.patients
  FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.is_admin(auth.uid()) OR
    public.has_role(auth.uid(), 'receptionist')
  );

CREATE POLICY "Admins and receptionists can insert patients" ON public.patients
  FOR INSERT WITH CHECK (
    public.is_admin(auth.uid()) OR
    public.has_role(auth.uid(), 'receptionist')
  );

CREATE POLICY "Admins and receptionists can update patients" ON public.patients
  FOR UPDATE USING (
    public.is_admin(auth.uid()) OR
    public.has_role(auth.uid(), 'receptionist')
  );

CREATE POLICY "Super admins can delete patients" ON public.patients
  FOR DELETE USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for doctors
CREATE POLICY "Everyone can view doctors" ON public.doctors
  FOR SELECT USING (true);

CREATE POLICY "Doctors can update own profile" ON public.doctors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage doctors" ON public.doctors
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for appointments
CREATE POLICY "Patients can view own appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.patients WHERE id = appointments.patient_id AND user_id = auth.uid())
  );

CREATE POLICY "Doctors can view their appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.doctors WHERE id = appointments.doctor_id AND user_id = auth.uid())
  );

CREATE POLICY "Staff can view all appointments" ON public.appointments
  FOR SELECT USING (
    public.has_role(auth.uid(), 'nurse') OR
    public.has_role(auth.uid(), 'receptionist') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Receptionists can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'receptionist') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Staff can update appointments" ON public.appointments
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'receptionist') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.is_admin(auth.uid()) OR
    EXISTS (SELECT 1 FROM public.doctors WHERE id = appointments.doctor_id AND user_id = auth.uid())
  );

-- RLS Policies for medical_records
CREATE POLICY "Patients can view own medical records" ON public.medical_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.patients WHERE id = medical_records.patient_id AND user_id = auth.uid())
  );

CREATE POLICY "Doctors and nurses can view all medical records" ON public.medical_records
  FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Doctors can create medical records" ON public.medical_records
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Doctors can update medical records" ON public.medical_records
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.doctors WHERE id = medical_records.doctor_id AND user_id = auth.uid()) OR
    public.is_admin(auth.uid())
  );

-- RLS Policies for prescriptions
CREATE POLICY "Patients can view own prescriptions" ON public.prescriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.patients WHERE id = prescriptions.patient_id AND user_id = auth.uid())
  );

CREATE POLICY "Medical staff can view all prescriptions" ON public.prescriptions
  FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Doctors can update own prescriptions" ON public.prescriptions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.doctors WHERE id = prescriptions.doctor_id AND user_id = auth.uid()) OR
    public.is_admin(auth.uid())
  );

-- RLS Policies for documents
CREATE POLICY "Patients can view own documents" ON public.documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.patients WHERE id = documents.patient_id AND user_id = auth.uid())
  );

CREATE POLICY "Medical staff can view all documents" ON public.documents
  FOR SELECT USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'nurse') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Doctors and admins can upload documents" ON public.documents
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'doctor') OR
    public.is_admin(auth.uid())
  );

CREATE POLICY "Admins can verify documents" ON public.documents
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_id);
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_documents_patient_id ON public.documents(patient_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();