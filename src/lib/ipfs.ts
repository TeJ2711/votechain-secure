// Simulated IPFS layer for storing election metadata
// Structured for future integration with actual IPFS (e.g., Pinata, Infura)

export interface IPFSMetadata {
  cid: string;
  name: string;
  size: number;
  timestamp: string;
  type: 'election' | 'candidate' | 'result';
  data: Record<string, unknown>;
}

function generateCID(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz234567';
  let cid = 'Qm';
  for (let i = 0; i < 44; i++) {
    cid += chars[Math.floor(Math.random() * chars.length)];
  }
  return cid;
}

const ipfsStore = new Map<string, IPFSMetadata>();

// Simulate uploading election metadata to IPFS
export async function uploadToIPFS(
  name: string,
  type: IPFSMetadata['type'],
  data: Record<string, unknown>
): Promise<IPFSMetadata> {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

  const metadata: IPFSMetadata = {
    cid: generateCID(),
    name,
    size: JSON.stringify(data).length,
    timestamp: new Date().toISOString(),
    type,
    data,
  };

  ipfsStore.set(metadata.cid, metadata);
  return metadata;
}

// Simulate retrieving metadata from IPFS
export async function fetchFromIPFS(cid: string): Promise<IPFSMetadata | null> {
  await new Promise(r => setTimeout(r, 400));
  return ipfsStore.get(cid) || null;
}

// Get IPFS gateway URL (simulated)
export function getIPFSUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`;
}

export function shortenCID(cid: string): string {
  return `${cid.slice(0, 8)}...${cid.slice(-6)}`;
}
