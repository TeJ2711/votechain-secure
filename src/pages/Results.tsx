import { useParams, useNavigate } from 'react-router-dom';
import { useElection, useCandidates, useElectionVotes } from '@/hooks/useElections';
import { mockElections, mockCandidates } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Users, Vote, TrendingUp, ExternalLink } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';

const COLORS = [
  'hsl(190, 95%, 50%)',
  'hsl(260, 80%, 60%)',
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
  'hsl(340, 82%, 52%)',
  'hsl(210, 78%, 56%)',
];

export default function Results() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: dbElection } = useElection(id || '');
  const { data: dbCandidates } = useCandidates(id || '');
  const { data: dbVotes } = useElectionVotes(id || '');

  // Fallback to mock data
  const mockElection = mockElections.find(e => e.id === id);

  const election = dbElection
    ? {
        title: dbElection.title,
        description: dbElection.description || '',
        status: dbElection.status,
        endDate: dbElection.end_date,
      }
    : mockElection
    ? { title: mockElection.title, description: mockElection.description, status: mockElection.status, endDate: mockElection.endDate }
    : null;

  // Compute vote counts per candidate from actual votes
  const { chartData, totalVotes, winner } = useMemo(() => {
    const mockCands = mockCandidates[id || ''] || [];
    const cands = dbCandidates && dbCandidates.length > 0 ? dbCandidates : mockCands;
    const votes = dbVotes || [];

    // Count votes per candidate
    const voteCounts: Record<string, number> = {};
    cands.forEach(c => (voteCounts[c.id] = 0));
    votes.forEach(v => {
      if (voteCounts[v.candidate_id] !== undefined) {
        voteCounts[v.candidate_id]++;
      }
    });

    // If using mock data and no real votes, use mock vote counts
    const useMockCounts = (!dbCandidates || dbCandidates.length === 0) && votes.length === 0;

    const total = useMockCounts
      ? mockCands.reduce((a, c) => a + (c.voteCount || 0), 0)
      : votes.length;

    const data = cands.map(c => {
      const count = useMockCounts ? (mockCands.find(m => m.id === c.id)?.voteCount || 0) : (voteCounts[c.id] || 0);
      return {
        id: c.id,
        name: c.name,
        party: c.party || 'Independent',
        votes: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      };
    });

    const w = data.length > 0 ? data.reduce((a, b) => (a.votes > b.votes ? a : b)) : null;

    return { chartData: data, totalVotes: total, winner: w };
  }, [id, dbCandidates, dbVotes]);

  if (!election) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Election not found</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{election.title}</h1>
          <Badge variant="outline" className={
            election.status === 'active' ? 'bg-success/10 text-success border-success/20' :
            election.status === 'ended' ? 'bg-muted text-muted-foreground' :
            'bg-warning/10 text-warning border-warning/20'
          }>{election.status}</Badge>
        </div>
        <p className="text-muted-foreground mb-8">
          {totalVotes.toLocaleString()} total votes cast
        </p>

        {/* Winner Banner */}
        {winner && winner.votes > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card-glow rounded-xl p-6 mb-8 border-primary/20"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary">
                <Trophy className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leading Candidate</p>
                <p className="text-xl font-bold">{winner.name}</p>
                <p className="text-sm text-primary">{winner.party} — {winner.votes.toLocaleString()} votes ({winner.percentage}%)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Vote, label: 'Total Votes', value: totalVotes.toLocaleString() },
            { icon: Users, label: 'Candidates', value: chartData.length },
            { icon: TrendingUp, label: 'Leader', value: winner ? `${winner.percentage}%` : 'N/A' },
          ].map(s => (
            <div key={s.label} className="card-glow rounded-xl p-4 text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {chartData.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Pie Chart */}
            <div className="card-glow rounded-xl p-6">
              <h3 className="font-semibold mb-4">Vote Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="votes"
                    label={({ name, percentage }) => `${name.split(' ')[0]} ${percentage}%`}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(220, 18%, 8%)',
                      border: '1px solid hsl(220, 16%, 16%)',
                      borderRadius: '8px',
                      color: 'hsl(210, 20%, 92%)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="card-glow rounded-xl p-6">
              <h3 className="font-semibold mb-4">Vote Count</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'hsl(215, 12%, 50%)', fontSize: 12 }}
                    tickFormatter={v => v.split(' ')[0]}
                  />
                  <YAxis tick={{ fill: 'hsl(215, 12%, 50%)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(220, 18%, 8%)',
                      border: '1px solid hsl(220, 16%, 16%)',
                      borderRadius: '8px',
                      color: 'hsl(210, 20%, 92%)',
                    }}
                  />
                  <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Candidate breakdown */}
        <h3 className="font-semibold mb-4">Candidate Rankings</h3>
        <div className="space-y-3">
          {[...chartData].sort((a, b) => b.votes - a.votes).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-glow rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }}
                  >
                    #{i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.party}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{c.votes.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{c.percentage}%</p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.percentage}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Blockchain note */}
        <div className="card-glow rounded-xl p-5 mt-8 flex items-start gap-3">
          <ExternalLink className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Blockchain Verified Results</p>
            <p className="text-xs text-muted-foreground mt-1">
              All votes in this election are recorded as immutable blockchain transactions. Each vote can be independently verified using its transaction hash.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
