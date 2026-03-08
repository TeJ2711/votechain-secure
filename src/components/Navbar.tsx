import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Shield, LogOut, User, Wallet, Sun, Moon, Menu } from 'lucide-react';
import { shortenAddress, connectWallet } from '@/lib/blockchain';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

export default function Navbar() {
  const { user, logout, connectWallet: setWallet } = useAuth();
  const navigate = useNavigate();
  const [connecting, setConnecting] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const handleConnectWallet = async () => {
    setConnecting(true);
    try {
      const address = await connectWallet();
      await setWallet(address);
      toast.success('Wallet connected!');
    } catch {
      toast.error('Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  const navActions = (
    <>
      <Button variant="ghost" size="icon" onClick={toggle} className="shrink-0">
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {user ? (
        <>
          {user.walletAddress ? (
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground">
              <Wallet className="h-3 w-3 text-primary" />
              {shortenAddress(user.walletAddress)}
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={handleConnectWallet} disabled={connecting} className="hidden md:flex">
              <Wallet className="mr-2 h-4 w-4" />
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
          <Link to="/profile" className="hidden md:flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 hover:bg-secondary/80 transition-colors">
            <User className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-medium">{user.name}</span>
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {user.role}
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:flex">
            <LogOut className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button size="sm" className="bg-gradient-primary text-primary-foreground" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      )}
    </>
  );

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
          {navActions}

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-4 mt-8">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>

                    {user.walletAddress ? (
                      <div className="flex items-center gap-2 rounded-lg border border-border p-3 font-mono text-xs text-muted-foreground">
                        <Wallet className="h-4 w-4 text-primary shrink-0" />
                        {shortenAddress(user.walletAddress)}
                      </div>
                    ) : (
                      <Button variant="outline" onClick={handleConnectWallet} disabled={connecting}>
                        <Wallet className="mr-2 h-4 w-4" />
                        {connecting ? 'Connecting...' : 'Connect Wallet'}
                      </Button>
                    )}

                    <Button variant="outline" onClick={() => { setOpen(false); navigate('/dashboard'); }}>
                      Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => { setOpen(false); navigate('/profile'); }}>
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Button>

                    <Button variant="ghost" onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild onClick={() => setOpen(false)}>
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button className="bg-gradient-primary text-primary-foreground" asChild onClick={() => setOpen(false)}>
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
