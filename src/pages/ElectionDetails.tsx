import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useElection, useCandidates, useHasVoted, useCastVote } from '@/hooks/useElections';
import { mockElections, mockCandidates } from '@/lib/mock-data';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { castVoteOnChain } from '@/lib/blockchain';
import CountdownTimer from '@/components/CountdownTimer';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, Loader2, Vote, Users, Shield, Wallet, Blocks, IdCard } from 'lucide-react';
import { toast } from 'sonner';

export default function ElectionDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [txProgress, setTxProgress] = useState(0);

  const { data: dbElection } = useElection(id || '');
  const { data: dbCandidates } = useCandidates(id || '');
  const { data: hasVotedAlready } = useHasVoted(id || '');
  const castVoteMutation = useCastVote();

  const mockElection = mockElections.find(e => e.id === id);
  const election = dbElection ? {
    id: dbElection.id,
    title: dbElection.title,
    description: dbElection.description || '',
    startDate: dbElection.start_date,
    endDate: dbElection.end_date,
    status: dbElection.status as 'active' | 'upcoming' | 'ended',
    totalVoters: 0,
    totalVotes: 0,
  } : mockElection;

  const candidates = dbCandidates && dbCandidates.length > 0
    ? dbCandidates.map(c => ({ id: c.id, name: c.name, party: c.party, electionId: c.election_id, voteCount: 0 }))
    : (mockCandidates[id || ''] || []);

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
      toast.error('Please connect your wallet first from the dashboard');
      return;
    }

    setVoting(true);
    setTxProgress(10);

    try {
      // Simulate blockchain progress
      const progressInterval = setInterval(() => {
        setTxProgress(prev => Math.min(prev + Math.random() * 15, 85));
      }, 500);

      const tx = await castVoteOnChain(election.id, selectedCandidate, user.walletAddress);
      clearInterval(progressInterval);
      setTxProgress(90);

      // Save to database
      await castVoteMutation.mutateAsync({
        candidate_id: selectedCandidate,
        election_id: election.id,
        blockchain_hash: tx.hash,
      });

      setTxProgress(100);

      const candidateName = candidates.find(c => c.id === selectedCandidate)?.name || 'Unknown';

      // Navigate to confirmation page
      setTimeout(() => {
        navigate('/vote-confirmation', {
          state: {
            txHash: tx.hash,
            candidateName,
            electionTitle: election.title,
            blockNumber: tx.blockNumber,
            timestamp: tx.timestamp,
          },
        });
      }, 500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to cast vote');
      setTxProgress(0);
      setVoting(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {candidates.length} candidates</span>
                <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Blockchain secured</span>
                <span className="flex items-center gap-1"><Blocks className="h-4 w-4" /> Ethereum</span>
              </div>
            </div>
            {election.status === 'active' && <CountdownTimer targetDate={election.endDate} />}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {hasVotedAlready ? (
            <motion.div key="already-voted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-glow rounded-xl p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Already Voted</h2>
              <p className="text-muted-foreground mb-4">
                You have already cast your vote in this election. Your vote is securely stored on the blockchain.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate(`/results/${election.id}`)}>
                  View Results
                </Button>
                <Button className="bg-gradient-primary text-primary-foreground" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </motion.div>
          ) : voting ? (
            <motion.div key="voting-progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glow rounded-xl p-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Recording Vote on Blockchain</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {txProgress < 30 ? 'Connecting to Ethereum network...' :
                 txProgress < 60 ? 'Submitting transaction to smart contract...' :
                 txProgress < 90 ? 'Waiting for block confirmation...' :
                 'Vote confirmed!'}
              </p>
              <Progress value={txProgress} className="max-w-sm mx-auto" />
              <p className="text-xs text-muted-foreground mt-2">{Math.round(txProgress)}% complete</p>
            </motion.div>
          ) : (
            <motion.div key="voting">
              {!user?.walletAddress && (
                <div className="card-glow rounded-xl p-4 mb-4 flex items-center gap-3 border-warning/20">
                  <Wallet className="h-5 w-5 text-warning shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    You need to connect your MetaMask wallet before voting. Go to your <button onClick={() => navigate('/dashboard')} className="text-primary underline">dashboard</button> to connect.
                  </p>
                </div>
              )}

              <h2 className="text-lg font-semibold mb-4">Select a Candidate</h2>
              <div className="space-y-3 mb-6">
                {candidates.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
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
                        {selectedCandidate === c.id && <CheckCircle className="h-5 w-5 text-primary" />}
                      </div>
                    </button>
                  </motion.div>
                ))}
                {candidates.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No candidates registered yet</p>
                )}
              </div>

              {election.status === 'active' && candidates.length > 0 && (
                <Button
                  onClick={handleVote}
                  disabled={!selectedCandidate || !user?.walletAddress}
                  className="w-full bg-gradient-primary text-primary-foreground h-12 text-base"
                >
                  <Vote className="mr-2 h-5 w-5" /> Cast Vote
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
