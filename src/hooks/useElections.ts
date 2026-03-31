import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ElectionRow {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string;
  created_at: string;
}

export interface CandidateRow {
  id: string;
  name: string;
  party: string;
  election_id: string;
  image_url: string | null;
}

export interface VoteRow {
  id: string;
  voter_id: string;
  candidate_id: string;
  election_id: string;
  blockchain_hash: string;
  created_at: string;
}

// Fetch all elections
export function useElections() {
  return useQuery({
    queryKey: ['elections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ElectionRow[];
    },
  });
}

// Fetch single election
export function useElection(id: string) {
  return useQuery({
    queryKey: ['election', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ElectionRow;
    },
    enabled: !!id,
  });
}

// Fetch candidates for an election
export function useCandidates(electionId: string) {
  return useQuery({
    queryKey: ['candidates', electionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId);
      if (error) throw error;
      return data as CandidateRow[];
    },
    enabled: !!electionId,
  });
}

// Fetch votes for an election (with candidate counts)
export function useElectionVotes(electionId: string) {
  return useQuery({
    queryKey: ['votes', electionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', electionId);
      if (error) throw error;
      return data as VoteRow[];
    },
    enabled: !!electionId,
  });
}

// Check if current user voted in an election
export function useHasVoted(electionId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['hasVoted', electionId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('votes')
        .select('id')
        .eq('election_id', electionId)
        .eq('voter_id', user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!electionId && !!user,
  });
}

// Create election mutation
export function useCreateElection() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { title: string; description: string; start_date: string; end_date: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('elections').insert({
        ...data,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['elections'] }),
  });
}

// Add candidate mutation
export function useAddCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; party: string; election_id: string }) => {
      const { error } = await supabase.from('candidates').insert(data);
      if (error) throw error;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['candidates', vars.election_id] }),
  });
}

// Delete candidate
export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, electionId }: { id: string; electionId: string }) => {
      const { error } = await supabase.from('candidates').delete().eq('id', id);
      if (error) throw error;
      return electionId;
    },
    onSuccess: (electionId) => qc.invalidateQueries({ queryKey: ['candidates', electionId] }),
  });
}

// Cast vote mutation
export function useCastVote() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (data: { candidate_id: string; election_id: string; blockchain_hash: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('votes').insert({
        ...data,
        voter_id: user.id,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['votes', vars.election_id] });
      qc.invalidateQueries({ queryKey: ['hasVoted', vars.election_id] });
    },
  });
}

// Update election status
export function useUpdateElectionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('elections').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['elections'] }),
  });
}

// Delete election mutation
export function useDeleteElection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('elections').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['elections'] }),
  });
}
