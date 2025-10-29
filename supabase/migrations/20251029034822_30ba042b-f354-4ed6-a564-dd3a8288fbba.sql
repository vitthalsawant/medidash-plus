-- Create function to handle role-specific record creation
CREATE OR REPLACE FUNCTION public.handle_user_role_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Get user profile data
  SELECT * INTO user_profile FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create role-specific records based on the assigned role
  IF NEW.role = 'doctor' THEN
    -- Check if doctor record doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM public.doctors WHERE user_id = NEW.user_id) THEN
      INSERT INTO public.doctors (
        user_id,
        full_name,
        email,
        phone,
        specialization,
        qualification,
        experience_years,
        consultation_fee
      ) VALUES (
        NEW.user_id,
        user_profile.full_name,
        (SELECT email FROM auth.users WHERE id = NEW.user_id),
        COALESCE(user_profile.phone, ''),
        'General Practice',
        'MD',
        0,
        50
      );
    END IF;
    
  ELSIF NEW.role = 'patient' THEN
    -- Check if patient record doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM public.patients WHERE user_id = NEW.user_id) THEN
      INSERT INTO public.patients (
        user_id,
        full_name,
        email,
        phone,
        date_of_birth,
        gender
      ) VALUES (
        NEW.user_id,
        user_profile.full_name,
        (SELECT email FROM auth.users WHERE id = NEW.user_id),
        COALESCE(user_profile.phone, ''),
        COALESCE(user_profile.date_of_birth, CURRENT_DATE - INTERVAL '30 years'),
        'other'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for role creation
DROP TRIGGER IF EXISTS on_user_role_created ON public.user_roles;
CREATE TRIGGER on_user_role_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_role_creation();