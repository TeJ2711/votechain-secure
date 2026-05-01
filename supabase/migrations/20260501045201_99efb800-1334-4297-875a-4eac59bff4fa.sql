DROP POLICY IF EXISTS "Users can insert own feedback" ON public.election_feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.election_feedback;

CREATE POLICY "Users can insert own feedback"
ON public.election_feedback
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
ON public.election_feedback
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);