REVOKE EXECUTE ON FUNCTION public.check_voter_id_available(text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_voter_id_available(text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.check_voter_id_available(text, uuid) TO authenticated;