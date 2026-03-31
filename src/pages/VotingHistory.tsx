import { useAuth } from '@/hooks/useAuth';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Hash, Calendar, ExternalLink, Vote, ArrowLeft, CheckCircle } from 'lucide-react';
import { shortenHash, getEtherscanUrl } from '@/lib/blockchain';

interface VoteWithDetails {
  id: string;
  blockchain_hash: string;
  created_at: string;
  election_id: string;
  candidate_id: string;
  elections: { title: string; status: string } | null;
  candidates: { name: string; party: string } | null;
}

export default function VotingHistory() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: votes, isLoading } = useQuery({
    queryKey: ['my-votes', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('*, elections(title, status), candidates(name, party)')
        .eq('voter_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as VoteWithDetails[];
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="container py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Vote className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Voting History</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          All your past votes with blockchain verification details.
        </p>

        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">Loading your votes...</div>
        ) : !votes || votes.length === 0 ? (
          <div className="card-glow rounded-xl p-12 text-center">
            <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No votes yet</h2>
            <p className="text-muted-foreground mb-4">You haven't participated in any elections yet.</p>
            <Button className="bg-gradient-primary text-primary-foreground" asChild>
              <Link to="/dashboard">Browse Elections</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {votes.length} vote{votes.length !== 1 ? 's' : ''} cast
            </p>
            {votes.map((v, i) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-glow rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {v.elections?.title || 'Unknown Election'}
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          v.elections?.status === 'active'
                            ? 'bg-success/10 text-success border-success/20'
                            : v.elections?.status === 'ended'
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-warning/10 text-warning border-warning/20'
                        }
                      >
                        {v.elections?.status || 'unknown'}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      Voted for <span className="font-medium text-foreground">{v.candidates?.name || 'Unknown'}</span>
                      {v.candidates?.party && (
                        <span className="text-muted-foreground"> — {v.candidates.party}</span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(v.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {v.blockchain_hash && (
                        <span className="flex items-center gap-1.5 font-mono">
                          <Hash className="h-3 w-3" />
                          {shortenHash(v.blockchain_hash)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <CheckCircle className="h-4 w-4 text-success" />
                    {v.blockchain_hash && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(getEtherscanUrl(v.blockchain_hash), '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {v.blockchain_hash && (
                  <div className="mt-3 rounded-lg bg-secondary/50 p-2.5">
                    <p className="text-[10px] text-muted-foreground mb-0.5">Transaction Hash</p>
                    <p className="font-mono text-xs break-all text-primary">{v.blockchain_hash}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
