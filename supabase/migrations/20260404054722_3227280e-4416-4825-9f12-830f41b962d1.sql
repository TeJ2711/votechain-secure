
CREATE TABLE public.election_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (election_id, user_id)
);

ALTER TABLE public.election_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own feedback"
ON public.election_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
ON public.election_feedback
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins and auditors can view all feedback"
ON public.election_feedback
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'auditor'::app_role));
