import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface VoteOtpDialogProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function VoteOtpDialog({ open, onClose, onVerified }: VoteOtpDialogProps) {
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (open) {
      setOtp('');
      setError('');
      setGeneratedOtp(generateOtp());
    }
  }, [open]);

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      if (otp === generatedOtp) {
        onVerified();
      } else {
        setError('Invalid code. Please try again.');
      }
      setVerifying(false);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Two-Factor Verification
          </DialogTitle>
          <DialogDescription>
            Enter the verification code below to confirm your vote. This adds an extra layer of security.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Your verification code</p>
            <p className="text-3xl font-mono font-bold tracking-[0.3em] text-primary">{generatedOtp}</p>
          </div>

          <div>
            <Input
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
              className="text-center text-lg font-mono tracking-widest"
              maxLength={6}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && otp.length === 6 && handleVerify()}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>

          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || verifying}
            className="w-full bg-gradient-primary text-primary-foreground"
          >
            {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            {verifying ? 'Verifying...' : 'Verify & Cast Vote'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
