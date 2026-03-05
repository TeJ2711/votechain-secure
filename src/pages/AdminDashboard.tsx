import { useState } from 'react';
import { mockElections, mockCandidates } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Vote, BarChart3, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Election "${title}" created!`);
    setShowCreate(false);
    setTitle('');
    setStartDate('');
    setEndDate('');
  };

  const totalVotes = mockElections.reduce((acc, e) => acc + (e.totalVotes || 0), 0);
  const totalVoters = mockElections.reduce((acc, e) => acc + (e.totalVoters || 0), 0);

  return (
    <div className="container py-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage elections and monitor activity</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Create Election
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Election</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Election title" required className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1.5" />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1.5" />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground">Create Election</Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Vote, label: 'Total Elections', value: mockElections.length },
          { icon: Users, label: 'Total Voters', value: totalVoters.toLocaleString() },
          { icon: BarChart3, label: 'Votes Cast', value: totalVotes.toLocaleString() },
          { icon: Settings, label: 'Active Now', value: mockElections.filter(e => e.status === 'active').length },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-glow rounded-xl p-5">
            <s.icon className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Elections Table */}
      <div className="card-glow rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-left">
                <th className="p-4 font-medium text-muted-foreground">Election</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground">Candidates</th>
                <th className="p-4 font-medium text-muted-foreground">Votes</th>
                <th className="p-4 font-medium text-muted-foreground">Turnout</th>
              </tr>
            </thead>
            <tbody>
              {mockElections.map(e => {
                const candidates = mockCandidates[e.id] || [];
                const turnout = e.totalVoters ? Math.round(((e.totalVotes || 0) / e.totalVoters) * 100) : 0;
                return (
                  <tr key={e.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium">{e.title}</td>
                    <td className="p-4">
                      <Badge variant="outline" className={
                        e.status === 'active' ? 'bg-success/10 text-success border-success/20' :
                        e.status === 'upcoming' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-muted text-muted-foreground'
                      }>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="p-4">{candidates.length}</td>
                    <td className="p-4">{e.totalVotes?.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${turnout}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{turnout}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
