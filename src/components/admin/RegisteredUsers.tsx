import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, Wallet, Calendar, ShieldCheck, Search, IdCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface UserWithRole {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  wallet_address: string | null;
  voter_id: string | null;
  created_at: string;
  role: string;
}

const ROLES = ['voter', 'admin', 'auditor'] as const;

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

function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      // Update existing role row
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registered-users'] });
      toast.success('User role updated');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update role'),
  });
}

const roleBadgeClass: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  voter: 'bg-success/10 text-success border-success/20',
  auditor: 'bg-warning/10 text-warning border-warning/20',
};

export default function RegisteredUsers() {
  const { data: users, isLoading } = useRegisteredUsers();
  const updateRole = useUpdateUserRole();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleChange = (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      toast.error("You can't change your own role");
      return;
    }
    updateRole.mutate({ userId, newRole });
  };

  const filteredUsers = users?.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.voter_id && u.voter_id.toLowerCase().includes(q)) ||
      u.name.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glow rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Registered Users</h2>
        {users && (
          <Badge variant="outline" className="ml-auto">{users.length} total</Badge>
        )}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or Voter ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading users...</p>
      ) : !filteredUsers || filteredUsers.length === 0 ? (
        <p className="text-sm text-muted-foreground">{searchQuery ? 'No users match your search' : 'No registered users yet'}</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map(u => {
            const isSelf = u.user_id === currentUser?.id;
            return (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{u.name || 'Unnamed'}</p>
                    {isSelf && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">You</Badge>
                    )}
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
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Select
                    value={u.role}
                    onValueChange={(val) => handleRoleChange(u.user_id, val)}
                    disabled={isSelf || updateRole.isPending}
                  >
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(r => (
                        <SelectItem key={r} value={r} className="text-xs">
                          <Badge variant="outline" className={`${roleBadgeClass[r]} text-[10px] px-1.5 py-0`}>
                            {r}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
