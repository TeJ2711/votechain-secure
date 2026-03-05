import { useParams, useNavigate } from 'react-router-dom';
import { mockElections, mockCandidates } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(190, 95%, 50%)', 'hsl(260, 80%, 60%)', 'hsl(160, 84%, 39%)', 'hsl(38, 92%, 50%)'];

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const election = mockElections.find(e => e.id === id);
  const candidates = mockCandidates[id || ''] || [];

  if (!election) {
    return <div className="container py-16 text-center text-muted-foreground">Election not found</div>;
  }

  const totalVotes = candidates.reduce((acc, c) => acc + (c.voteCount || 0), 0);
  const chartData = candidates.map(c => ({
    name: c.name,
    votes: c.voteCount || 0,
    percentage: totalVotes > 0 ? Math.round(((c.voteCount || 0) / totalVotes) * 100) : 0,
  }));

  const winner = candidates.reduce((a, b) => ((a.voteCount || 0) > (b.voteCount || 0) ? a : b), candidates[0]);
  const turnout = election.totalVoters ? Math.round(((election.totalVotes || 0) / election.totalVoters) * 100) : 0;

  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
        <p className="text-muted-foreground mb-8">Election Results — {totalVotes.toLocaleString()} total votes</p>

        {/* Winner Banner */}
        {winner && (
          <div className="card-glow rounded-xl p-6 mb-8 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary">
                <Trophy className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leading Candidate</p>
                <p className="text-xl font-bold">{winner.name}</p>
                <p className="text-sm text-primary">{winner.party} — {winner.voteCount?.toLocaleString()} votes</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Pie Chart */}
          <div className="card-glow rounded-xl p-6">
            <h3 className="font-semibold mb-4">Vote Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="votes" label={({ name, percentage }) => `${name.split(' ')[0]} ${percentage}%`}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 8%)', border: '1px solid hsl(220, 16%, 16%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="card-glow rounded-xl p-6">
            <h3 className="font-semibold mb-4">Vote Count</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                <XAxis dataKey="name" tick={{ fill: 'hsl(215, 12%, 50%)', fontSize: 12 }} tickFormatter={v => v.split(' ')[0]} />
                <YAxis tick={{ fill: 'hsl(215, 12%, 50%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 8%)', border: '1px solid hsl(220, 16%, 16%)', borderRadius: '8px', color: 'hsl(210, 20%, 92%)' }} />
                <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Voter Turnout */}
        <div className="card-glow rounded-xl p-6 mb-8">
          <h3 className="font-semibold mb-4">Voter Turnout</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${turnout}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            <span className="text-xl font-bold text-primary">{turnout}%</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {election.totalVotes?.toLocaleString()} out of {election.totalVoters?.toLocaleString()} eligible voters
          </p>
        </div>

        {/* Candidate breakdown */}
        <div className="space-y-3">
          {candidates.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0)).map((c, i) => {
            const pct = totalVotes > 0 ? Math.round(((c.voteCount || 0) / totalVotes) * 100) : 0;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-glow rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold" style={{ backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }}>
                      #{i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.party}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{c.voteCount?.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{pct}%</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
