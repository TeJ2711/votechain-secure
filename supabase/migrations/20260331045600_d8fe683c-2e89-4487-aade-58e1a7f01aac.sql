
-- Allow admins to delete elections
CREATE POLICY "Admins can delete elections"
ON public.elections
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Cascade delete candidates when election is deleted
ALTER TABLE public.candidates
DROP CONSTRAINT IF EXISTS candidates_election_id_fkey;

ALTER TABLE public.candidates
ADD CONSTRAINT candidates_election_id_fkey
FOREIGN KEY (election_id) REFERENCES public.elections(id) ON DELETE CASCADE;

-- Cascade delete votes when election is deleted
ALTER TABLE public.votes
DROP CONSTRAINT IF EXISTS votes_election_id_fkey;

ALTER TABLE public.votes
ADD CONSTRAINT votes_election_id_fkey
FOREIGN KEY (election_id) REFERENCES public.elections(id) ON DELETE CASCADE;
