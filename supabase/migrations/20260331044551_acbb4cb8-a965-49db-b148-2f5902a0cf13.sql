
-- Create a function to check voter_id uniqueness (usable from client)
CREATE OR REPLACE FUNCTION public.check_voter_id_available(p_voter_id text, p_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE voter_id = p_voter_id
    AND (p_user_id IS NULL OR user_id != p_user_id)
  )
$$;
