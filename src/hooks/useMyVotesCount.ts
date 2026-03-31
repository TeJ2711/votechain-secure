import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useMyVotesCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-votes-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('votes')
        .select('id', { count: 'exact', head: true })
        .eq('voter_id', user!.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}
