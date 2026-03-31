import { useState } from 'react';
import { useElections, useCreateElection, useCandidates, useAddCandidate, useDeleteCandidate, useUpdateElectionStatus, useElectionVotes, useDeleteElection } from '@/hooks/useElections';
import { uploadToIPFS, shortenCID, getIPFSUrl } from '@/lib/ipfs';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Vote, BarChart3, Settings, Trash2, UserPlus, StopCircle, Play, Eye, Send, Database, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { shortenHash } from '@/lib/blockchain';
import RegisteredUsers from '@/components/admin/RegisteredUsers';

function ManageCandidates({ electionId }: { electionId: string }) {
  const { data: candidates, isLoading } = useCandidates(electionId);
  const addCandidate = useAddCandidate();
  const deleteCandidate = useDeleteCandidate();
  const [name, setName] = useState('');
  const [party, setParty] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addCandidate.mutate({ name, party, election_id: electionId }, {
      onSuccess: () => { setName(''); setParty(''); toast.success('Candidate added'); },
      onError: (err: any) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input placeholder="Candidate name" value={name} onChange={e => setName(e.target.value)} required />
        <Input placeholder="Party" value={party} onChange={e => setParty(e.target.value)} />
        <Button type="submit" size="sm" className="bg-gradient-primary text-primary-foreground shrink-0" disabled={addCandidate.isPending}>
          <UserPlus className="mr-1 h-4 w-4" /> Add
        </Button>
      </form>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : candidates && candidates.length > 0 ? (
        <div className="space-y-2">
          {candidates.map(c => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3">
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.party}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteCandidate.mutate({ id: c.id, electionId })}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No candidates yet</p>
      )}
    </div>
  );
}

function ElectionVotes({ electionId }: { electionId: string }) {
  const { data: votes, isLoading } = useElectionVotes(electionId);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading votes...</p>;
  if (!votes || votes.length === 0) return <p className="text-sm text-muted-foreground">No votes cast yet</p>;

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {votes.map(v => (
        <div key={v.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3 text-sm">
          <span className="font-mono text-xs text-muted-foreground">
            {v.blockchain_hash ? shortenHash(v.blockchain_hash) : 'No hash'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(v.created_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const { data: dbElections } = useElections();
  const createElection = useCreateElection();
  const updateStatus = useUpdateElectionStatus();
  const deleteElection = useDeleteElection();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedElection, setSelectedElection] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [publishedCIDs, setPublishedCIDs] = useState<Record<string, string>>({});

  const elections = dbElections ?? [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createElection.mutate(
      { title, description, start_date: new Date(startDate).toISOString(), end_date: new Date(endDate).toISOString() },
      {
        onSuccess: () => { toast.success(`Election "${title}" created!`); setShowCreate(false); setTitle(''); setDescription(''); setStartDate(''); setEndDate(''); },
        onError: (err: any) => toast.error(err.message),
      }
    );
  };

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast.success(`Election ${status}`),
      onError: (err: any) => toast.error(err.message),
    });
  };

  const handlePublishResults = async (electionId: string, electionTitle: string) => {
    setPublishing(electionId);
    try {
      const metadata = await uploadToIPFS(electionTitle, 'result', {
        electionId,
        title: electionTitle,
        publishedAt: new Date().toISOString(),
        status: 'finalized',
      });
      setPublishedCIDs(prev => ({ ...prev, [electionId]: metadata.cid }));
      toast.success(`Results published to IPFS! CID: ${shortenCID(metadata.cid)}`);
    } catch {
      toast.error('Failed to publish results');
    } finally {
      setPublishing(null);
    }
  };

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage elections, candidates, and monitor activity</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Create Election
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Election</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Election title" required className="mt-1.5" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe this election..." className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Start Date</Label><Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1.5" /></div>
                <div><Label>End Date</Label><Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1.5" /></div>
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground" disabled={createElection.isPending}>
                {createElection.isPending ? 'Creating...' : 'Create Election'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Vote, label: 'Total Elections', value: elections.length },
          { icon: Users, label: 'Active', value: elections.filter(e => e.status === 'active').length },
          { icon: BarChart3, label: 'Upcoming', value: elections.filter(e => e.status === 'upcoming').length },
          { icon: Settings, label: 'Ended', value: elections.filter(e => e.status === 'ended').length },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-glow rounded-xl p-5">
            <s.icon className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Election Management */}
      <div className="space-y-4">
        {elections.map(e => (
          <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-glow rounded-xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{e.title}</h3>
                    <Badge variant="outline" className={
                      e.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                      e.status === 'upcoming' ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-muted text-muted-foreground'
                    }>{e.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{e.description}</p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {e.status === 'upcoming' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(e.id, 'active')}>
                      <Play className="mr-1 h-3 w-3" /> Start
                    </Button>
                  )}
                  {e.status === 'active' && (
                    <Button variant="outline" size="sm" onClick={() => handleStatusChange(e.id, 'ended')}>
                      <StopCircle className="mr-1 h-3 w-3" /> End
                    </Button>
                  )}
                  {e.status === 'ended' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublishResults(e.id, e.title)}
                      disabled={publishing === e.id || !!publishedCIDs[e.id]}
                    >
                      {publishedCIDs[e.id] ? (
                        <><Database className="mr-1 h-3 w-3" /> Published</>
                      ) : publishing === e.id ? (
                        'Publishing...'
                      ) : (
                        <><Send className="mr-1 h-3 w-3" /> Publish Results</>
                      )}
                    </Button>
                  )}
                   <Button variant="outline" size="sm" asChild>
                    <Link to={`/results/${e.id}`}><Eye className="mr-1 h-3 w-3" /> Results</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Election?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{e.title}" along with all candidates and votes. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteElection.mutate(e.id, {
                            onSuccess: () => toast.success(`Election "${e.title}" deleted`),
                            onError: (err: any) => toast.error(err.message || 'Failed to delete'),
                          })}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* IPFS CID display */}
              {publishedCIDs[e.id] && (
                <div className="flex items-center gap-2 rounded-lg bg-success/5 border border-success/20 p-2 mb-3 text-xs">
                  <Database className="h-3.5 w-3.5 text-success shrink-0" />
                  <span className="text-muted-foreground">IPFS CID:</span>
                  <span className="font-mono text-primary">{shortenCID(publishedCIDs[e.id])}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={() => window.open(getIPFSUrl(publishedCIDs[e.id]), '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {selectedElection === e.id ? (
                <Tabs defaultValue="candidates" className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="candidates">Manage Candidates</TabsTrigger>
                    <TabsTrigger value="votes">View Votes</TabsTrigger>
                  </TabsList>
                  <TabsContent value="candidates" className="mt-4">
                    <ManageCandidates electionId={e.id} />
                  </TabsContent>
                  <TabsContent value="votes" className="mt-4">
                    <ElectionVotes electionId={e.id} />
                  </TabsContent>
                </Tabs>
              ) : (
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setSelectedElection(e.id)}>
                  <Settings className="mr-1 h-3 w-3" /> Manage
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Registered Users */}
      <div className="mt-8">
        <RegisteredUsers />
      </div>
    </div>
  );
}
