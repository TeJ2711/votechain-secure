import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, ArrowLeft, Shield, Hash, Clock, Blocks } from 'lucide-react';
import { getEtherscanUrl, shortenHash } from '@/lib/blockchain';

interface ConfirmationState {
  txHash: string;
  candidateName: string;
  electionTitle: string;
  blockNumber?: number;
  timestamp?: string;
}

export default function VoteConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ConfirmationState | null;

  if (!state) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">No confirmation data found</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 border border-success/20"
        >
          <CheckCircle className="h-10 w-10 text-success" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold mb-2"
        >
          Vote Successfully Cast!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-8"
        >
          Your vote has been permanently recorded on the blockchain.
        </motion.p>

        {/* Transaction Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-glow rounded-xl p-6 mb-6 text-left"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Blocks className="h-5 w-5 text-primary" />
            Transaction Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Hash className="h-3.5 w-3.5" /> Transaction Hash
              </span>
              <span className="font-mono text-xs text-primary">{shortenHash(state.txHash)}</span>
            </div>
            {state.blockNumber && (
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Blocks className="h-3.5 w-3.5" /> Block Number
                </span>
                <span className="font-mono text-sm">{state.blockNumber.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Timestamp
              </span>
              <span className="text-sm">
                {state.timestamp ? new Date(state.timestamp).toLocaleString() : new Date().toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Election</span>
              <span className="text-sm font-medium">{state.electionTitle}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Candidate</span>
              <span className="text-sm font-medium">{state.candidateName}</span>
            </div>
          </div>

          {/* Full hash */}
          <div className="mt-4 rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground mb-1">Full Transaction Hash</p>
            <p className="font-mono text-xs break-all text-primary">{state.txHash}</p>
          </div>
        </motion.div>

        {/* Security note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-glow rounded-xl p-4 mb-8 flex items-start gap-3 text-left"
        >
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Your Vote is Secure</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your vote is immutably stored on the blockchain. It cannot be altered, deleted, or tampered with.
              You can verify your vote at any time using the transaction hash above.
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            variant="outline"
            onClick={() => window.open(getEtherscanUrl(state.txHash), '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" /> View on Etherscan
          </Button>
          <Button
            className="bg-gradient-primary text-primary-foreground"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
