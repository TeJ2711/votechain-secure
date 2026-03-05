import type { Election, Candidate } from '@/types';

export const mockElections: Election[] = [
  {
    id: '1',
    title: 'Student Council President 2026',
    description: 'Annual election for the Student Council President position. All registered students are eligible to vote.',
    startDate: '2026-03-01T08:00:00Z',
    endDate: '2026-03-15T20:00:00Z',
    status: 'active',
    createdBy: 'admin-1',
    totalVoters: 2450,
    totalVotes: 1823,
  },
  {
    id: '2',
    title: 'Department Head — Computer Science',
    description: 'Election for the Head of Computer Science Department. Faculty members only.',
    startDate: '2026-03-10T08:00:00Z',
    endDate: '2026-03-20T20:00:00Z',
    status: 'active',
    createdBy: 'admin-1',
    totalVoters: 150,
    totalVotes: 89,
  },
  {
    id: '3',
    title: 'Faculty Senate Representative',
    description: 'Elect a representative to the Faculty Senate for the 2026-2027 academic year.',
    startDate: '2026-04-01T08:00:00Z',
    endDate: '2026-04-10T20:00:00Z',
    status: 'upcoming',
    createdBy: 'admin-1',
    totalVoters: 800,
    totalVotes: 0,
  },
  {
    id: '4',
    title: 'Board of Trustees Election',
    description: 'Annual election for two positions on the Board of Trustees.',
    startDate: '2026-02-01T08:00:00Z',
    endDate: '2026-02-28T20:00:00Z',
    status: 'ended',
    createdBy: 'admin-1',
    totalVoters: 5000,
    totalVotes: 3456,
  },
];

export const mockCandidates: Record<string, Candidate[]> = {
  '1': [
    { id: 'c1', name: 'Amara Chen', party: 'Innovation Alliance', electionId: '1', voteCount: 682 },
    { id: 'c2', name: 'Marcus Rivera', party: 'Unity Coalition', electionId: '1', voteCount: 598 },
    { id: 'c3', name: 'Priya Sharma', party: 'Progress Front', electionId: '1', voteCount: 543 },
  ],
  '2': [
    { id: 'c4', name: 'Dr. Sarah Kim', party: 'Independent', electionId: '2', voteCount: 45 },
    { id: 'c5', name: 'Prof. James Okoro', party: 'Independent', electionId: '2', voteCount: 44 },
  ],
  '3': [
    { id: 'c6', name: 'Dr. Emily Foster', party: 'Academic Reform', electionId: '3', voteCount: 0 },
    { id: 'c7', name: 'Dr. Michael Zhang', party: 'Faculty First', electionId: '3', voteCount: 0 },
  ],
  '4': [
    { id: 'c8', name: 'Helena Patel', party: 'Vision 2030', electionId: '4', voteCount: 1890 },
    { id: 'c9', name: 'Robert Kim', party: 'Tradition & Trust', electionId: '4', voteCount: 1566 },
  ],
};
