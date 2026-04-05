-- Prevent duplicate votes: one vote per voter per election
ALTER TABLE public.votes
  ADD CONSTRAINT votes_voter_election_unique UNIQUE (voter_id, election_id);