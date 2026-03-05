import { useAuth } from '@/hooks/useAuth';
import { mockElections } from '@/lib/mock-data';
import ElectionCard from '@/components/ElectionCard';
import { motion } from 'framer-motion';
import { Vote, Clock, CheckCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function VoterDashboard() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');
  const [search, setSearch] = useState('');

  const filtered = mockElections
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  const active = mockElections.filter(e => e.status === 'active').length;
  const upcoming = mockElections.filter(e => e.status === 'upcoming').length;
  const ended = mockElections.filter(e => e.status === 'ended').length;

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-1">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mb-8">Your voting dashboard</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Vote, label: 'Active', value: active, color: 'text-success' },
          { icon: Clock, label: 'Upcoming', value: upcoming, color: 'text-warning' },
          { icon: CheckCircle, label: 'Completed', value: ended, color: 'text-muted-foreground' },
        ].map(s => (
          <div key={s.label} className="card-glow rounded-xl p-4">
            <div className="flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search elections..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'upcoming', 'ended'] as const).map(f => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-gradient-primary text-primary-foreground' : ''}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Elections */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((e, i) => (
          <ElectionCard key={e.id} election={e} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center text-muted-foreground">No elections found</div>
        )}
      </div>
    </div>
  );
}
