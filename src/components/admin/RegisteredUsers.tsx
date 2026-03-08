import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Wallet, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserWithRole {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  wallet_address: string | null;
  created_at: string;
  role: string;
}

function useRegisteredUsers() {
  return useQuery({
    queryKey: ['admin-registered-users'],
    queryFn: async () => {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (pErr) throw pErr;

      const { data: roles, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id, role');
      if (rErr) throw rErr;

      const roleMap = new Map<string, string>();
      roles?.forEach(r => roleMap.set(r.user_id, r.role));

      return (profiles ?? []).map(p => ({
        ...p,
        role: roleMap.get(p.user_id) ?? 'voter',
      })) as UserWithRole[];
    },
  });
}

const roleBadgeClass: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  voter: 'bg-success/10 text-success border-success/20',
  auditor: 'bg-warning/10 text-warning border-warning/20',
};

export default function RegisteredUsers() {
  const { data: users, isLoading } = useRegisteredUsers();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glow rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Registered Users</h2>
        {users && (
          <Badge variant="outline" className="ml-auto">{users.length} total</Badge>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : !users || users.length === 0 ? (
        <p className="text-sm text-muted-foreground">No registered users yet</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map(u => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{u.name || 'Unnamed'}</p>
                  <Badge variant="outline" className={roleBadgeClass[u.role] ?? 'bg-muted text-muted-foreground'}>
                    {u.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {u.email && (
                    <span className="flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 shrink-0" /> {u.email}
                    </span>
                  )}
                  {u.wallet_address && (
                    <span className="flex items-center gap-1 font-mono">
                      <Wallet className="h-3 w-3 shrink-0" /> {u.wallet_address.slice(0, 6)}...{u.wallet_address.slice(-4)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0 ml-2">
                <Calendar className="h-3 w-3" />
                {new Date(u.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
