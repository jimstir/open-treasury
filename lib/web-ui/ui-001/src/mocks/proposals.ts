export interface Proposal {
  id: number;
  treasuryId: number;
  title: string;
  description: string;
  createdDate: string;
  endDate?: string; // Added for tracking proposal deadline
  closedDate: string | null;
  status: 'active' | 'closed' | 'executed' | 'rejected' | 'pending' | 'open';
  votesFor: number;
  votesAgainst: number;
  hasVoted: boolean;
  voteType?: 'accept' | 'reject' | null;
  ownerApproved?: boolean;
  votePercentage?: number;
  reserveId?: number; // For backward compatibility
  formData?: any; // For form data if needed
}

export const mockProposals: Proposal[] = [
  {
    id: 9,
    treasuryId: 1, // ETH Treasury
    title: 'New Proposal',
    description: 'This is a new proposal',
    createdDate: '2025-06-22T10:00:00Z',
    endDate: '2025-06-29T10:00:00Z', // Added for tracking proposal deadline
    closedDate: null,
    status: 'pending',
    votesFor: 0,
    votesAgainst: 0,
    hasVoted: false,
    ownerApproved: false
  },
  {
    id: 8,
    treasuryId: 3, // DAI Treasury
    title: 'Add DAI as Collateral',
    description: 'Proposal to add DAI as a new collateral type with 75% LTV ratio',
    createdDate: '2025-06-15T10:30:00Z',
    closedDate: null,
    status: 'pending',
    votesFor: 0,
    votesAgainst: 0,
    hasVoted: false,
    ownerApproved: false
  },
  {
    id: 7,
    treasuryId: 2, // USDC Treasury
    title: 'Emergency Parameter Update',
    description: 'Emergency update to risk parameters',
    createdDate: '2025-06-14T08:00:00Z',
    closedDate: '2025-06-21T08:00:00Z',
    status: 'pending',
    votesFor: 0,
    votesAgainst: 0,
    hasVoted: false,
    ownerApproved: false
  },
  {
    id: 6,
    treasuryId: 1, // ETH Treasury
    title: 'Liquidity Mining Program',
    description: 'Proposal for a new liquidity mining program',
    createdDate: '2025-06-13T10:30:00Z',
    closedDate: '2025-06-20T10:30:00Z',
    status: 'open',
    votesFor: 42,
    votesAgainst: 18,
    hasVoted: true,
    voteType: 'accept',
    ownerApproved: true
  },
  {
    id: 5,
    treasuryId: 2, // USDC Treasury
    title: 'Treasury Management Strategy',
    description: 'New treasury management strategy for USDC treasuries',
    createdDate: '2025-06-14T09:00:00Z',
    closedDate: '2025-06-21T09:00:00Z',
    status: 'pending',
    votesFor: 0,
    votesAgainst: 0,
    hasVoted: false,
    ownerApproved: false
  },
  {
    id: 4,
    treasuryId: 1, // ETH Treasury
    title: 'Update Protocol Fees',
    description: 'Proposal to adjust protocol fees for ETH market',
    createdDate: '2025-06-05T16:45:00Z',
    closedDate: '2025-06-12T14:30:00Z',
    status: 'rejected',
    votesFor: 8,
    votesAgainst: 25,
    hasVoted: true,
    voteType: 'reject',
    ownerApproved: true
  },
  {
    id: 3,
    treasuryId: 1, // ETH Treasury
    title: 'Add New Collateral Type',
    description: 'Proposal to add wstETH as collateral type',
    createdDate: '2025-05-28T11:20:00Z',
    closedDate: '2025-06-04T10:00:00Z',
    status: 'executed',
    votesFor: 30,
    votesAgainst: 5,
    hasVoted: true,
    voteType: 'accept',
    ownerApproved: true
  },
  {
    id: 2,
    treasuryId: 2, // USDC Treasury
    title: 'Update Risk Parameters',
    description: 'Adjust risk parameters for USDC lending pool',
    createdDate: '2025-06-01T09:15:00Z',
    closedDate: '2025-06-08T16:45:00Z',
    status: 'pending',
    votesFor: 22,
    votesAgainst: 8,
    hasVoted: true,
    voteType: 'accept',
    ownerApproved: false
  },
  {
    id: 1,
    treasuryId: 2, // USDC Treasury
    title: 'Increase USDC Allocation',
    description: 'Proposal to increase USDC allocation by 20% for Q3 2025',
    createdDate: '2025-06-10T14:30:00Z',
    closedDate: '2025-06-20T14:30:00Z',
    status: 'open',
    votesFor: 15,
    votesAgainst: 5,
    hasVoted: false,
    ownerApproved: true
  }
];
