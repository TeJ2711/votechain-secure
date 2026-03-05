export type UserRole = 'voter' | 'admin' | 'auditor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
}

export interface Election {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'ended';
  createdBy: string;
  totalVoters?: number;
  totalVotes?: number;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  electionId: string;
  imageUrl?: string;
  voteCount?: number;
}

export interface Vote {
  id: string;
  voterId: string;
  candidateId: string;
  electionId: string;
  blockchainHash: string;
  timestamp: string;
}

export interface BlockchainTransaction {
  hash: string;
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  status: 'confirmed' | 'pending';
}
