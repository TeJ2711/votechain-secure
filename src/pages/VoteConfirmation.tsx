import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, ArrowLeft, Shield, Hash, Clock, Blocks, Download } from 'lucide-react';
import { getEtherscanUrl, shortenHash } from '@/lib/blockchain';
import { toast } from 'sonner';

interface ConfirmationState {
  txHash: string;
  candidateName: string;
  electionTitle: string;
  blockNumber?: number;
  timestamp?: string;
}

function generateReceiptPDF(state: ConfirmationState) {
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, w, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('VOTELYTICS', w / 2, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Vote Receipt', w / 2, y, { align: 'center' });
    y += 8;
    doc.setFontSize(8);
    doc.text('Blockchain-Verified Voting Platform', w / 2, y, { align: 'center' });

    y = 55;
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ Vote Successfully Recorded', w / 2, y, { align: 'center' });

    // Details section
    y = 72;
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(20, y, w - 40, 80, 3, 3, 'FD');

    y += 12;
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const leftX = 30;
    const rightX = w - 30;

    const addRow = (label: string, value: string) => {
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(label, leftX, y);
      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.text(value, rightX, y, { align: 'right' });
      y += 12;
    };

    addRow('Election', state.electionTitle);
    addRow('Candidate', state.candidateName);
    addRow('Timestamp', state.timestamp ? new Date(state.timestamp).toLocaleString() : new Date().toLocaleString());
    if (state.blockNumber) {
      addRow('Block Number', state.blockNumber.toLocaleString());
    }

    // Transaction hash
    y += 8;
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Transaction Hash:', leftX, y);
    y += 8;
    doc.setFillColor(243, 244, 246);
    doc.roundedRect(20, y - 5, w - 40, 14, 2, 2, 'F');
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(7);
    doc.setFont('courier', 'normal');
    doc.text(state.txHash, w / 2, y + 3, { align: 'center' });

    // Footer
    y += 25;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, y, w - 20, y);
    y += 10;
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('This receipt confirms your vote was recorded on the blockchain.', w / 2, y, { align: 'center' });
    y += 5;
    doc.text('Your vote is immutable and cannot be altered or deleted.', w / 2, y, { align: 'center' });
    y += 5;
    doc.text(`Generated: ${new Date().toLocaleString()}`, w / 2, y, { align: 'center' });

    doc.save(`vote-receipt-${state.txHash.slice(0, 8)}.pdf`);
    toast.success('Receipt downloaded!');
  });
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
            onClick={() => generateReceiptPDF(state)}
          >
            <Download className="mr-2 h-4 w-4" /> Download Receipt
          </Button>
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