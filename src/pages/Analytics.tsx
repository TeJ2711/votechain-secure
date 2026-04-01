import { useElections, useElectionVotes, useCandidates } from '@/hooks/useElections';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, Vote, Activity, PieChart as PieIcon } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, PieChart, Pie,
} from 'recharts';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const COLORS = [
  'hsl(190, 95%, 50%)', 'hsl(260, 80%, 60%)', 'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)', 'hsl(340, 82%, 52%)', 'hsl(210, 78%, 56%)',
];

function useAllVotes() {
  return useQuery({
    queryKey: ['all-votes-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.from('votes').select('*');
      if (error) throw error;
      return data;
    },
  });
}

function useAllProfiles() {
  return useQuery({
    queryKey: ['all-profiles-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('user_id, created_at');
      if (error) throw error;
      return data;
    },
  });
}

export default function Analytics() {
  const { data: elections } = useElections();
  const { data: allVotes } = useAllVotes();
  const { data: profiles } = useAllProfiles();

  const stats = useMemo(() => {
    const elecs = elections ?? [];
    const votes = allVotes ?? [];
    const users = profiles ?? [];

    const totalVotes = votes.length;
    const activeElections = elecs.filter(e => e.status === 'active').length;
    const totalElections = elecs.length;
    const registeredVoters = users.length;
    const uniqueVoters = new Set(votes.map(v => v.voter_id)).size;
    const participationRate = registeredVoters > 0 ? Math.round((uniqueVoters / registeredVoters) * 100) : 0;

    // Votes per election
    const votesPerElection = elecs.map(e => ({
      name: e.title.length > 20 ? e.title.slice(0, 18) + '...' : e.title,
      votes: votes.filter(v => v.election_id === e.id).length,
      status: e.status,
    }));

    // Voting activity over time (last 30 days)
    const now = new Date();
    const days: { date: string; votes: number; registrations: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        votes: votes.filter(v => v.created_at.startsWith(dateStr)).length,
        registrations: users.filter(u => u.created_at.startsWith(dateStr)).length,
      });
    }

    // Election status distribution
    const statusDist = [
      { name: 'Active', value: elecs.filter(e => e.status === 'active').length, fill: 'hsl(160, 84%, 39%)' },
      { name: 'Upcoming', value: elecs.filter(e => e.status === 'upcoming').length, fill: 'hsl(38, 92%, 50%)' },
      { name: 'Ended', value: elecs.filter(e => e.status === 'ended').length, fill: 'hsl(215, 12%, 50%)' },
    ].filter(s => s.value > 0);

    return { totalVotes, activeElections, totalElections, registeredVoters, uniqueVoters, participationRate, votesPerElection, days, statusDist };
  }, [elections, allVotes, profiles]);

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-1">Election Analytics</h1>
        <p className="text-muted-foreground mb-8">Insights into voter participation and election activity</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { icon: Vote, label: 'Total Votes', value: stats.totalVotes },
          { icon: BarChart3, label: 'Elections', value: stats.totalElections },
          { icon: Activity, label: 'Active', value: stats.activeElections },
          { icon: Users, label: 'Registered', value: stats.registeredVoters },
          { icon: Users, label: 'Unique Voters', value: stats.uniqueVoters },
          { icon: TrendingUp, label: 'Participation', value: `${stats.participationRate}%` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-glow rounded-xl p-4">
            <s.icon className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Activity Over Time */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-glow rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Activity (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} interval={6} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="votes" name="Votes" stroke="hsl(190, 95%, 50%)" fill="hsl(190, 95%, 50%)" fillOpacity={0.15} />
              <Area type="monotone" dataKey="registrations" name="Registrations" stroke="hsl(260, 80%, 60%)" fill="hsl(260, 80%, 60%)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Votes Per Election */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-glow rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" /> Votes Per Election
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.votesPerElection}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                {stats.votesPerElection.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Election Status Distribution */}
      {stats.statusDist.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-glow rounded-xl p-6 max-w-md">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-primary" /> Election Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats.statusDist} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {stats.statusDist.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
