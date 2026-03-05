import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { mockElections, mockCandidates } from '@/lib/mock-data';
import { useAuth } from '@/hooks/useAuth';
import { castVoteOnChain } from '@/lib/blockchain';
import CountdownTimer from '@/components/CountdownTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Loader2, Vote, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function ElectionDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [txHash, setTxHash] = useState('');

  const election = mockElections.find(e => e.id === id);
  const candidates = mockCandidates[id || ''] || [];

  if (!election) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Election not found</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const handleVote = async () => {
    if (!selectedCandidate || !user) return;
    if (!user.walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    setVoting(true);
    try {
      const tx = await castVoteOnChain(election.id, selectedCandidate, user.walletAddress);
      setTxHash(tx.hash);
      setVoted(true);
      toast.success('Vote cast successfully!');
    } catch {
      toast.error('Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  const turnout = election.totalVoters ? Math.round(((election.totalVotes || 0) / election.totalVoters) * 100) : 0;

  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="card-glow rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <Badge variant="outline" className={
                election.status === 'active' ? 'bg-success/10 text-success border-success/20 mb-3' :
                election.status === 'upcoming' ? 'bg-warning/10 text-warning border-warning/20 mb-3' :
                'bg-muted text-muted-foreground mb-3'
              }>
                {election.status === 'active' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-success animate-pulse inline-block" />}
                {election.status.toUpperCase()}
              </Badge>
              <h1 className="text-2xl font-bold mb-2">{election.title}</h1>
              <p className="text-sm text-muted-foreground mb-4">{election.description}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {election.totalVoters?.toLocaleString()} eligible</span>
                <span className="flex items-center gap-1"><Vote className="h-4 w-4" /> {election.totalVotes?.toLocaleString()} votes</span>
                <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> {turnout}% turnout</span>
              </div>
            </div>
            {election.status === 'active' && <CountdownTimer targetDate={election.endDate} />}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {voted ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card-glow rounded-xl p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10"
              >
                <CheckCircle className="h-8 w-8 text-success" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Vote Confirmed!</h2>
              <p className="text-muted-foreground mb-4">Your vote has been recorded on the blockchain.</p>
              <div className="rounded-lg bg-secondary p-4 mb-4">
                <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                <p className="font-mono text-xs text-primary break-all">{txHash}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, '_blank')}>
                  View on Etherscan
                </Button>
                <Button className="bg-gradient-primary text-primary-foreground" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="voting">
              <h2 className="text-lg font-semibold mb-4">Select a Candidate</h2>
              <div className="space-y-3 mb-6">
                {candidates.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <button
                      onClick={() => setSelectedCandidate(c.id)}
                      disabled={election.status !== 'active'}
                      className={`w-full text-left rounded-xl p-5 border transition-all duration-200 ${
                        selectedCandidate === c.id
                          ? 'border-primary bg-primary/5 shadow-[var(--shadow-glow)]'
                          : 'border-border/50 bg-card hover:border-primary/30'
                      } ${election.status !== 'active' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm ${
                            selectedCandidate === c.id ? 'bg-gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                          }`}>
                            {c.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold">{c.name}</p>
                            <p className="text-sm text-muted-foreground">{c.party}</p>
                          </div>
                        </div>
                        {selectedCandidate === c.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              {election.status === 'active' && (
                <Button
                  onClick={handleVote}
                  disabled={!selectedCandidate || voting}
                  className="w-full bg-gradient-primary text-primary-foreground h-12 text-base"
                >
                  {voting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Recording on Blockchain...
                    </>
                  ) : (
                    <>
                      <Vote className="mr-2 h-5 w-5" />
                      Cast Vote
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
