import { useAuth } from '@/hooks/useAuth';
import { useElections } from '@/hooks/useElections';
import { useMyVotesCount } from '@/hooks/useMyVotesCount';
import ElectionCard from '@/components/ElectionCard';
import { motion } from 'framer-motion';
import { Vote, Clock, CheckCircle, Search, Wallet, Shield, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { mockElections } from '@/lib/mock-data';
import { connectWallet, shortenAddress } from '@/lib/blockchain';
import { toast } from 'sonner';

export default function VoterDashboard() {
  const { user, connectWallet: setWallet } = useAuth();
  const { data: dbElections, isLoading } = useElections();
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');
  const [search, setSearch] = useState('');
  const [connecting, setConnecting] = useState(false);

  const elections = useMemo(() => {
    if (dbElections && dbElections.length > 0) {
      return dbElections.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        startDate: e.start_date,
        endDate: e.end_date,
        status: e.status as 'upcoming' | 'active' | 'ended',
        createdBy: e.created_by,
        totalVoters: 0,
        totalVotes: 0,
      }));
    }
    return mockElections;
  }, [dbElections]);

  const filtered = elections
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e => e.title.toLowerCase().includes(search.toLowerCase()));

  const active = elections.filter(e => e.status === 'active').length;
  const upcoming = elections.filter(e => e.status === 'upcoming').length;
  const ended = elections.filter(e => e.status === 'ended').length;

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      const address = await connectWallet();
      await setWallet(address);
      toast.success('Wallet connected successfully!');
    } catch {
      toast.error('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-1">Welcome, {user?.name || 'Voter'}</h1>
        <p className="text-muted-foreground mb-6">Your voting dashboard</p>
      </motion.div>

      {/* Wallet Connection Banner */}
      {!user?.walletAddress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glow rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 shrink-0">
              <Wallet className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-sm">Connect Your Wallet</p>
              <p className="text-xs text-muted-foreground">
                Connect your MetaMask wallet to participate in blockchain-secured elections.
              </p>
            </div>
          </div>
          <Button
            onClick={handleConnectWallet}
            disabled={connecting}
            className="bg-gradient-primary text-primary-foreground shrink-0"
            size="sm"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {connecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </motion.div>
      )}

      {user?.walletAddress && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glow rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 shrink-0">
            <Shield className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="font-semibold text-sm flex items-center gap-2">
              Wallet Connected
              <CheckCircle className="h-3.5 w-3.5 text-success" />
            </p>
            <p className="text-xs text-muted-foreground font-mono">{shortenAddress(user.walletAddress)}</p>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Vote, label: 'Active', value: active, color: 'text-success' },
          { icon: Clock, label: 'Upcoming', value: upcoming, color: 'text-warning' },
          { icon: CheckCircle, label: 'Completed', value: ended, color: 'text-muted-foreground' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-glow rounded-xl p-4">
            <div className="flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
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

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Loading elections...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((e, i) => (
            <ElectionCard key={e.id} election={e} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 py-16 text-center text-muted-foreground">No elections found</div>
          )}
        </div>
      )}
    </div>
  );
}
