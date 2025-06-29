export interface ChainlinkSubscription {
  id: string;
  name: string;
  contractAddress: string;
  linkBalance: string;
  lastUpdate: string;
  status: 'active' | 'paused' | 'cancelled' | 'outOfFunds';
  gasLimit: number;
  lastPerformed: string | null;
  admin: string;
  linkBalanceInUsd: string;
  events: {
    type: 'topup' | 'withdrawal' | 'execution' | 'status_change';
    amount?: string;
    timestamp: string;
    txHash?: string;
    details?: string;
  }[];
}

export const mockChainlinkSubscriptions: ChainlinkSubscription[] = [
  {
    id: '1234567890123456789012345678901234567890123456789012345678901234',
    name: 'The Sky Treasury',
    contractAddress: '0x1234...abcd',
    linkBalance: '5.75',
    linkBalanceInUsd: '$115.00',
    lastUpdate: '2023-06-28T10:30:00Z',
    status: 'active',
    gasLimit: 500000,
    lastPerformed: '2023-06-28T10:15:00Z',
    admin: '0x1234...5678',
    events: [
      {
        type: 'execution',
        amount: '0.02 LINK',
        timestamp: '2023-06-28T10:15:00Z',
        txHash: '0x123...abc',
        details: 'Successfully executed upkeep'
      },
      {
        type: 'topup',
        amount: '5.75 LINK',
        timestamp: '2023-06-27T14:30:00Z',
        txHash: '0x456...def',
        details: 'Added funds to subscription'
      }
    ]
  },
  {
    id: '2234567890123456789012345678901234567890123456789012345678901234',
    name: 'ReEntering Treasury',
    contractAddress: '0x5678...ef01',
    linkBalance: '2.15',
    linkBalanceInUsd: '$43.00',
    lastUpdate: '2023-06-27T14:45:00Z',
    status: 'active',
    gasLimit: 750000,
    lastPerformed: '2023-06-27T14:30:00Z',
    admin: '0x1234...5678',
    events: [
      {
        type: 'execution',
        amount: '0.05 LINK',
        timestamp: '2023-06-27T14:30:00Z',
        txHash: '0x789...012',
        details: 'Successfully rebalanced USDC vault'
      },
      {
        type: 'topup',
        amount: '2.15 LINK',
        timestamp: '2023-06-26T10:15:00Z',
        txHash: '0x345...678',
        details: 'Added funds to subscription'
      }
    ]
  },
  {
    id: '3234567890123456789012345678901234567890123456789012345678901234',
    name: 'Growing Growth Treasury',
    contractAddress: '0x9abc...2345',
    linkBalance: '0.15',
    linkBalanceInUsd: '$3.00',
    lastUpdate: '2023-06-28T09:15:00Z',
    status: 'outOfFunds',
    gasLimit: 1000000,
    lastPerformed: '2023-06-25T18:20:00Z',
    admin: '0x1234...5678',
    events: [
      {
        type: 'status_change',
        timestamp: '2023-06-28T09:15:00Z',
        details: 'Subscription out of funds',
        amount: '0.01 LINK',
        txHash: '0x901...234'
      },
      {
        type: 'execution',
        amount: '0.01 LINK',
        timestamp: '2023-06-25T18:20:00Z',
        txHash: '0x567...890',
        details: 'Successfully claimed staking rewards'
      }
    ]
  }
];
