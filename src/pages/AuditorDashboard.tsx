import { useState } from 'react';
import { mockElections } from '@/lib/mock-data';
import { verifyTransaction, shortenHash } from '@/lib/blockchain';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, Shield, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function AuditorDashboard() {
  const [txHash, setTxHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!txHash) return;
    setVerifying(true);
    try {
      const tx = await verifyTransaction(txHash);
      setResult(tx);
      toast.success('Transaction verified!');
    } catch {
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold mb-1">Auditor Dashboard</h1>
        <p className="text-muted-foreground mb-8">Verify votes and ensure election transparency</p>
      </motion.div>

      {/* Verify Transaction */}
      <div className="card-glow rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Verify Transaction
        </h2>
        <div className="flex gap-3">
          <Input
            placeholder="Enter blockchain transaction hash (0x...)"
            value={txHash}
            onChange={e => setTxHash(e.target.value)}
            className="font-mono text-sm"
          />
          <Button onClick={handleVerify} disabled={verifying} className="bg-gradient-primary text-primary-foreground shrink-0">
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hash</span>
                <span className="font-mono text-xs">{shortenHash(result.hash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Block</span>
                <span className="font-mono">{result.blockNumber.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">Confirmed</Badge>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Election Overview */}
      <h2 className="font-semibold mb-4">Election Results Overview</h2>
      <div className="space-y-3">
        {mockElections.map((e, i) => {
          const turnout = e.totalVoters ? Math.round(((e.totalVotes || 0) / e.totalVoters) * 100) : 0;
          return (
            <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card-glow rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.totalVotes?.toLocaleString()} votes — {turnout}% turnout</p>
                </div>
                <Link to={`/results/${e.id}`}>
                  <Button variant="outline" size="sm">
                    View Results <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
