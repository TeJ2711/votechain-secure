import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  election_id: string | null;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        qc.invalidateQueries({ queryKey: ['notifications', user.id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, qc]);

  const unreadCount = query.data?.filter(n => !n.read).length ?? 0;

  return { ...query, unreadCount };
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllRead() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true } as any)
        .eq('user_id', user!.id)
        .eq('read', false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

/** Send a notification to all voters about an election status change */
export async function notifyAllVoters(electionTitle: string, status: string, electionId: string) {
  // Fetch all user IDs from profiles
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('user_id');
  if (pErr) throw pErr;

  const title = status === 'active'
    ? `Election Started: ${electionTitle}`
    : `Election Ended: ${electionTitle}`;

  const message = status === 'active'
    ? `The election "${electionTitle}" has commenced. You can now cast your vote.`
    : `The election "${electionTitle}" has ended. Results are now available.`;

  const notifications = (profiles ?? []).map(p => ({
    user_id: p.user_id,
    title,
    message,
    type: status === 'active' ? 'election_started' : 'election_ended',
    election_id: electionId,
  }));

  if (notifications.length > 0) {
    const { error } = await supabase.from('notifications').insert(notifications as any);
    if (error) throw error;
  }
}
