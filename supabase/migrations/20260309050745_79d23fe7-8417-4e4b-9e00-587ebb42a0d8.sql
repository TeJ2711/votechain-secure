ALTER TABLE public.profiles ADD COLUMN voter_id text UNIQUE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
BEGIN
  _role := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'role', ''),
    'voter'
  )::app_role;

  INSERT INTO public.profiles (user_id, name, email, voter_id)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email, NEW.raw_user_meta_data->>'voter_id');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);
  
  RETURN NEW;
END;
$function$;