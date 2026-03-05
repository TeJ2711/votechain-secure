// Simulated blockchain layer — structured for real Ethers.js swap later
import type { BlockchainTransaction } from '@/types';

function generateHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function generateAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

// Simulate MetaMask wallet connection
export async function connectWallet(): Promise<string> {
  // In real implementation: window.ethereum.request({ method: 'eth_requestAccounts' })
  await new Promise(r => setTimeout(r, 1500));
  return generateAddress();
}

// Simulate casting a vote on the blockchain
export async function castVoteOnChain(
  electionId: string,
  candidateId: string,
  voterAddress: string
): Promise<BlockchainTransaction> {
  // Simulate blockchain transaction time
  await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
  
  return {
    hash: generateHash(),
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    timestamp: new Date().toISOString(),
    from: voterAddress,
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18', // Contract address
    status: 'confirmed',
  };
}

// Simulate verifying a transaction
export async function verifyTransaction(txHash: string): Promise<BlockchainTransaction | null> {
  await new Promise(r => setTimeout(r, 800));
  
  return {
    hash: txHash,
    blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
    timestamp: new Date().toISOString(),
    from: generateAddress(),
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18',
    status: 'confirmed',
  };
}

export function getEtherscanUrl(txHash: string): string {
  return `https://etherscan.io/tx/${txHash}`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function shortenHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
