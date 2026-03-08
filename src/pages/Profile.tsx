import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Wallet, ShieldCheck, Calendar, Copy, Check, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { shortenAddress, connectWallet } from '@/lib/blockchain';

const roleBadgeClass: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  voter: 'bg-success/10 text-success border-success/20',
  auditor: 'bg-warning/10 text-warning border-warning/20',
};

export default function Profile() {
  const { user, isLoading, connectWallet: setWallet } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const handleEdit = () => {
    setName(user.name);
    setEditing(true);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty');
      return;
    }
    if (trimmed.length > 100) {
      toast.error('Name must be less than 100 characters');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: trimmed })
        .eq('user_id', user.id);
      if (error) throw error;
      toast.success('Profile updated');
      setEditing(false);
      // Reload to reflect changes
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyWallet = () => {
    if (user.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      toast.success('Wallet address copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  return (
    <div className="container max-w-2xl py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground text-2xl font-bold">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name || 'User'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={roleBadgeClass[user.role] ?? 'bg-muted text-muted-foreground'}>
                <ShieldCheck className="h-3 w-3 mr-1" />
                {user.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </div>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving} className="bg-gradient-primary text-primary-foreground">
                  <Save className="h-3.5 w-3.5 mr-1" /> {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3 w-3" /> Display Name
              </Label>
              {editing ? (
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                />
              ) : (
                <p className="text-sm font-medium">{user.name || 'Not set'}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email Address
              </Label>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Wallet */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Wallet Connection</CardTitle>
            <CardDescription>Your blockchain identity for voting</CardDescription>
          </CardHeader>
          <CardContent>
            {user.walletAddress ? (
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Connected Wallet</p>
                    <p className="font-mono text-sm truncate">{user.walletAddress}</p>
                    <p className="font-mono text-xs text-muted-foreground md:hidden">
                      {shortenAddress(user.walletAddress)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCopyWallet} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <Wallet className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No wallet connected yet</p>
                <Button onClick={handleConnectWallet} disabled={connecting} className="bg-gradient-primary text-primary-foreground">
                  <Wallet className="mr-2 h-4 w-4" />
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Details</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Role
              </span>
              <Badge variant="outline" className={roleBadgeClass[user.role] ?? 'bg-muted text-muted-foreground'}>
                {user.role}
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> User ID
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {user.id.slice(0, 8)}...{user.id.slice(-4)}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
