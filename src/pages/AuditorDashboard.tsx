import { useState } from 'react';
import { useElections, useElectionVotes } from '@/hooks/useElections';
import { mockElections } from '@/lib/mock-data';
import { verifyTransaction, shortenHash, getEtherscanUrl } from '@/lib/blockchain';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, Shield, ExternalLink, Eye, Hash, AlertTriangle, Activity, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

function ElectionAuditVotes({ electionId }: { electionId: string }) {
  const { data: votes, isLoading } = useElectionVotes(electionId);

  if (isLoading) return <p className="text-sm text-muted-foreground py-4">Loading votes...</p>;
  if (!votes || votes.length === 0) return <p className="text-sm text-muted-foreground py-4">No votes recorded yet</p>;

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto mt-3">
      {votes.map(v => (
        <div key={v.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3">
          <div className="flex items-center gap-3">
            <Hash className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-mono text-xs text-muted-foreground">
              {v.blockchain_hash ? shortenHash(v.blockchain_hash) : 'No hash'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {new Date(v.created_at).toLocaleString()}
            </span>
            {v.blockchain_hash && (
              <Button variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => window.open(getEtherscanUrl(v.blockchain_hash), '_blank')}>
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground text-center pt-2">
        {votes.length} vote{votes.length !== 1 ? 's' : ''} recorded
      </p>
    </div>
  );
}

function IntegrityCheck({ electionId }: { electionId: string }) {
  const { data: votes } = useElectionVotes(electionId);
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<{ total: number; valid: number; invalid: number; noHash: number } | null>(null);

  const runCheck = async () => {
    if (!votes) return;
    setChecking(true);
    let valid = 0, invalid = 0, noHash = 0;

    for (const v of votes) {
      if (!v.blockchain_hash || v.blockchain_hash === '') {
        noHash++;
        continue;
      }
      try {
        await verifyTransaction(v.blockchain_hash);
        valid++;
      } catch {
        invalid++;
      }
    }

    setResults({ total: votes.length, valid, invalid, noHash });
    setChecking(false);
    toast.success('Integrity check complete');
  };

  return (
    <div className="mt-3 space-y-3">
      <Button onClick={runCheck} disabled={checking || !votes?.length} variant="outline" size="sm">
        {checking ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Shield className="mr-1 h-3 w-3" />}
        {checking ? 'Checking...' : 'Run Integrity Check'}
      </Button>
      {results && (
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-lg bg-secondary/50 p-2 text-center">
            <p className="text-lg font-bold">{results.total}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="rounded-lg bg-success/10 p-2 text-center">
            <p className="text-lg font-bold text-success">{results.valid}</p>
            <p className="text-[10px] text-muted-foreground">Valid</p>
          </div>
          <div className="rounded-lg bg-destructive/10 p-2 text-center">
            <p className="text-lg font-bold text-destructive">{results.invalid}</p>
            <p className="text-[10px] text-muted-foreground">Invalid</p>
          </div>
          <div className="rounded-lg bg-warning/10 p-2 text-center">
            <p className="text-lg font-bold text-warning">{results.noHash}</p>
            <p className="text-[10px] text-muted-foreground">No Hash</p>
          </div>
        </div>
      )}
    </div>
  );
}

function useAuditLog() {
  return useQuery({
    queryKey: ['audit-activity-log'],
    queryFn: async () => {
      // Fetch recent votes across all elections as activity
      const { data: votes, error } = await supabase
        .from('votes')
        .select('id, election_id, blockchain_hash, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;

      const { data: elections } = await supabase.from('elections').select('id, title, status, updated_at');
      const elecMap = new Map((elections ?? []).map(e => [e.id, e]));

      return (votes ?? []).map(v => ({
        id: v.id,
        type: 'vote' as const,
        hash: v.blockchain_hash,
        electionTitle: elecMap.get(v.election_id)?.title ?? 'Unknown',
        timestamp: v.created_at,
      }));
    },
  });
}

export default function AuditorDashboard() {
  const { data: dbElections } = useElections();
  const [txHash, setTxHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expandedElection, setExpandedElection] = useState<string | null>(null);
  const { data: activityLog } = useAuditLog();

  const elections = dbElections && dbElections.length > 0
    ? dbElections.map(e => ({ id: e.id, title: e.title, description: e.description || '', status: e.status, totalVoters: 0, totalVotes: 0 }))
    : mockElections.map(e => ({ id: e.id, title: e.title, description: e.description, status: e.status, totalVoters: e.totalVoters || 0, totalVotes: e.totalVotes || 0 }));

  const handleVerify = async () => {
    if (!txHash.trim()) return;
    setVerifying(true);
    setResult(null);
    try {
      const tx = await verifyTransaction(txHash.trim());
      setResult(tx);
      toast.success('Transaction verified on blockchain!');
    } catch {
      toast.error('Verification failed — transaction not found');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-1">Auditor Dashboard</h1>
        <p className="text-muted-foreground mb-8">Verify votes, run integrity checks, and monitor activity</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Verify Transaction */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-glow rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Verify Blockchain Transaction
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a transaction hash to verify its authenticity on the blockchain.
            </p>
            <div className="flex gap-3">
              <Input placeholder="Enter blockchain transaction hash (0x...)" value={txHash}
                onChange={e => setTxHash(e.target.value)} className="font-mono text-sm"
                onKeyDown={e => e.key === 'Enter' && handleVerify()} />
              <Button onClick={handleVerify} disabled={verifying || !txHash.trim()} className="bg-gradient-primary text-primary-foreground shrink-0">
                <Search className="mr-2 h-4 w-4" />
                {verifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-lg bg-success/5 border border-success/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="font-semibold text-success">Transaction Verified</span>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Hash</span><span className="font-mono text-xs">{shortenHash(result.hash)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Block Number</span><span className="font-mono">{result.blockNumber.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Timestamp</span><span className="text-xs">{new Date(result.timestamp).toLocaleString()}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      {result.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">From</span><span className="font-mono text-xs">{result.from.slice(0, 10)}...{result.from.slice(-6)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Contract</span><span className="font-mono text-xs">{result.to.slice(0, 10)}...{result.to.slice(-6)}</span></div>
                </div>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => window.open(getEtherscanUrl(result.hash), '_blank')}>
                  <ExternalLink className="mr-2 h-3 w-3" /> View on Etherscan
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Activity Log */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-glow rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {!activityLog || activityLog.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              activityLog.map(a => (
                <div key={a.id} className="flex items-start gap-2 rounded-lg border border-border/30 bg-secondary/20 p-2.5">
                  <Hash className="h-3 w-3 text-primary mt-1 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">Vote in {a.electionTitle}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{a.hash ? shortenHash(a.hash) : 'No hash'}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(a.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Integrity Note */}
      <div className="card-glow rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">Audit Transparency</p>
          <p className="text-xs text-muted-foreground mt-1">
            All votes are stored as immutable blockchain transactions. Run integrity checks to verify database records match on-chain data.
          </p>
        </div>
      </div>

      {/* Election Overview */}
      <h2 className="font-semibold mb-4 flex items-center gap-2">
        <Eye className="h-5 w-5 text-primary" />
        Election Audit Overview
      </h2>
      <div className="space-y-3">
        {elections.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-glow rounded-xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{e.title}</p>
                    <Badge variant="outline" className={
                      e.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                      e.status === 'upcoming' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-muted text-muted-foreground'
                    }>{e.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{e.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setExpandedElection(expandedElection === e.id ? null : e.id)}>
                    <Hash className="mr-1 h-3 w-3" /> Audit
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/results/${e.id}`}><Eye className="mr-1 h-3 w-3" /> Results</Link>
                  </Button>
                </div>
              </div>

              {expandedElection === e.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <IntegrityCheck electionId={e.id} />
                  <ElectionAuditVotes electionId={e.id} />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
