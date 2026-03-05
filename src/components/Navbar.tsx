import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, User, Wallet } from 'lucide-react';
import { shortenAddress, connectWallet } from '@/lib/blockchain';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, logout, connectWallet: setWallet } = useAuth();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      const address = await connectWallet();
      setWallet(address);
      toast.success('Wallet connected!');
    } catch {
      toast.error('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Vote<span className="text-gradient">lytics</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.walletAddress ? (
                <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground">
                  <Wallet className="h-3 w-3 text-primary" />
                  {shortenAddress(user.walletAddress)}
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConnectWallet}
                  disabled={connecting}
                  className="hidden sm:flex"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium">{user.name}</span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {user.role}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-gradient-primary text-primary-foreground" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
