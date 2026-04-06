-- Fix privilege escalation: always assign 'voter' role on signup regardless of client metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email, voter_id)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email, NEW.raw_user_meta_data->>'voter_id');
  
  -- Always assign 'voter' role - never trust client-supplied role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'voter'::app_role);
  
  RETURN NEW;
END;
$$;