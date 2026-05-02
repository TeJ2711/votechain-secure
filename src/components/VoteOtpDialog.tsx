import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface VoteOtpDialogProps {
  open: boolean;
  onClose: () => void;
  onVerified: () => void;
}

/**
 * Final vote confirmation dialog.
 *
 * Note: a previous version of this component generated a 6-digit code in the
 * browser and asked the user to type it back. That provided no real security
 * (the code was visible in the UI and in React state) and has been removed.
 * Real 2FA must be enforced server-side — see Supabase Auth MFA.
 */
export default function VoteOtpDialog({ open, onClose, onVerified }: VoteOtpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Confirm Your Vote
          </DialogTitle>
          <DialogDescription>
            Once submitted, your vote will be recorded on the blockchain and cannot be changed.
            Please confirm you want to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-warning/5 border border-warning/20 p-4 flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            This action is final. Make sure you have selected the correct candidate before confirming.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onVerified} className="bg-gradient-primary text-primary-foreground">
            <ShieldCheck className="mr-2 h-4 w-4" /> Confirm & Cast Vote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
