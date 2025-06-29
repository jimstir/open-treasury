export interface Treasury {
  id: number;
  treasuryName: string;
  contractAddress: string;
  tokenSymbol: string;
  proposalTokenSymbol: string;
  totalValueLocked: string;
  apy?: string;  // Made optional
  isJoined: boolean;
  openProposals: number;
  closedProposals: number;
  totalMembers: number;
  yourStake?: string;
  ownerAddress: string;
  authorizedUsers: string[];
  treasuryTokenBalance: string;
  proposalTokenBalance: string;
}

export const mockTreasuries: Treasury[] = [
  {
    id: 1,
    treasuryName: 'Ethereum Treasury',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenSymbol: 'ETH',
    proposalTokenSymbol: 'pETH',
    totalValueLocked: '$1.2M',
    apy: '4.5%',
    isJoined: false,
    openProposals: 3,
    closedProposals: 12,
    totalMembers: 45,
    yourStake: '0.0 ETH',
    ownerAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    authorizedUsers: [
      '0x34567890abcdef1234567890abcdef1234567890',
      '0x4567890abcdef1234567890abcdef123456789012'
    ],
    treasuryTokenBalance: '0.0 ETH',
    proposalTokenBalance: '0.0 pETH'
  },
  {
    id: 2,
    treasuryName: 'USDC Treasury',
    contractAddress: '0x2345678901abcdef1234567890abcdef12345678',
    tokenSymbol: 'USDC',
    proposalTokenSymbol: 'pUSDC',
    totalValueLocked: '$5.7M',
    apy: '3.2%',
    isJoined: true,
    openProposals: 5,
    closedProposals: 8,
    totalMembers: 32,
    yourStake: '1,250 USDC',
    ownerAddress: '0xbcdef1234567890abcdef1234567890abcdef1234',
    authorizedUsers: [
      '0x567890abcdef1234567890abcdef123456789012',
      '0x67890abcdef1234567890abcdef12345678901234'
    ],
    treasuryTokenBalance: '1,250 USDC',
    proposalTokenBalance: '500 pUSDC'
  },
  {
    id: 3,
    treasuryName: 'Aave Treasury',
    contractAddress: '0x3456789012abcdef1234567890abcdef12345678',
    tokenSymbol: 'AAVE',
    proposalTokenSymbol: 'pAAVE',
    totalValueLocked: '$2.1M',
    apy: '5.8%',
    isJoined: false,
    openProposals: 2,
    closedProposals: 5,
    totalMembers: 28,
    yourStake: '0.0 AAVE',
    ownerAddress: '0xcdef1234567890abcdef1234567890abcdef1234',
    authorizedUsers: [
      '0x7890abcdef1234567890abcdef12345678901234',
      '0x890abcdef1234567890abcdef1234567890123456'
    ],
    treasuryTokenBalance: '0.0 AAVE',
    proposalTokenBalance: '0.0 pAAVE'
  },
  {
    id: 4,
    treasuryName: 'Dai Treasury',
    contractAddress: '0x4567890123abcdef1234567890abcdef12345678',
    tokenSymbol: 'DAI',
    proposalTokenSymbol: 'pDAI',
    totalValueLocked: '$3.6M',
    apy: '3.9%',
    isJoined: false,
    openProposals: 1,
    closedProposals: 7,
    totalMembers: 51,
    yourStake: '0.0 DAI',
    ownerAddress: '0xdef1234567890abcdef1234567890abcdef123456',
    authorizedUsers: [
      '0x9012abcdef1234567890abcdef12345678901234',
      '0x0123456789abcdef1234567890abcdef12345678'
    ],
    treasuryTokenBalance: '0.0 DAI',
    proposalTokenBalance: '0.0 pDAI'
  },
  {
    id: 5,
    treasuryName: 'Bitcoin Treasury',
    contractAddress: '0x5678901234abcdef1234567890abcdef12345678',
    tokenSymbol: 'WBTC',
    proposalTokenSymbol: 'pWBTC',
    totalValueLocked: '$8.2M',
    apy: '2.8%',
    isJoined: true,
    openProposals: 4,
    closedProposals: 15,
    totalMembers: 67,
    yourStake: '0.25 WBTC',
    ownerAddress: '0xef1234567890abcdef1234567890abcdef1234567',
    authorizedUsers: [
      '0x1234567890abcdef1234567890abcdef12345678',
      '0x2345678901abcdef1234567890abcdef12345678'
    ],
    treasuryTokenBalance: '0.25 WBTC',
    proposalTokenBalance: '0.1 pWBTC'
  }
];
