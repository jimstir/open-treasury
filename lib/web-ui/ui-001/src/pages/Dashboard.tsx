import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { deployTreasuryToken } from '../blockchain/treasuryTokenService';
import { deployReserveVault } from '../blockchain/treasuryVaultService';
import { deployCrowdsale } from '../blockchain/crowdsaleService';
import CreateTreasuryModal from '../components/CreateTreasuryModal';
import CrowdsaleModal from '../components/CrowdsaleModal';
import { mockTreasuries } from '../mocks/treasuries';
import type { Treasury } from '../mocks/treasuries';
import { mockProposals, Proposal } from '../mocks/proposals';
import { mockChainlinkSubscriptions, ChainlinkSubscription } from '../mocks/chainlinkSubscriptions';
import ChainlinkSubscriptions from '../components/ChainlinkSubscriptions';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface DashboardProps {
  togglePreferences?: () => void;
  closeNotifications?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  togglePreferences: togglePrefs = () => {},
  closeNotifications: closeNotifs = () => {}
}) => {
  const [showPreferences, setShowPreferences] = useState(false);
  const [showCreateTreasuryModal, setShowCreateTreasuryModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCrowdsaleModal, setShowCrowdsaleModal] = useState(false);
  const [subscriptions, setSubscriptions] = useState<ChainlinkSubscription[]>(mockChainlinkSubscriptions);
  const [deployedContracts, setDeployedContracts] = useState<{
    treasuryTokenAddress: string;
    treasuryVaultAddress: string;
    treasuryTokenSymbol: string;
    treasuryVaultSymbol: string;
  } | null>(null);
  const [treasuries, setTreasuries] = useState<Treasury[]>(mockTreasuries);
  // Add endDate to mock proposals
  const [proposals] = useState<Proposal[]>([
    ...mockProposals,
    {
      id: 101,
      treasuryId: 1,
      title: 'Add New Liquidity Pool',
      description: 'Proposal to add a new liquidity pool for DAI stablecoin',
      createdDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      closedDate: null,
      status: 'active',
      votesFor: 3500,
      votesAgainst: 1200,
      hasVoted: true,
      voteType: 'accept',
      ownerApproved: true
    },
    {
      id: 102,
      treasuryId: 2,
      title: 'Update Protocol Fee',
      description: 'Proposal to reduce protocol fee from 0.3% to 0.25%',
      createdDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      closedDate: null,
      status: 'active',
      votesFor: 4200,
      votesAgainst: 3800,
      hasVoted: false,
      voteType: 'accept',
      ownerApproved: true
    }
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'New Proposal',
      message: 'Voting has started on Proposal #123',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      title: 'System Update',
      message: 'New features available in your dashboard',
      time: '1 day ago',
      read: false
    },
    {
      id: 3,
      title: 'Reminder',
      message: 'Don\'t forget to vote on the active proposals',
      time: '2 days ago',
      read: true
    }
  ]);

  // Get accepted proposals that the user has voted on
  const acceptedProposals = useMemo(() => 
    proposals
      .filter((proposal: Proposal) => 
        proposal.hasVoted && 
        proposal.voteType === 'accept' && 
        proposal.status === 'active'
      )
      .map(proposal => ({
        ...proposal,
        votePercentage: Math.round((proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100)
      })),
    [proposals]
  );

  // Chainlink Subscription Handlers
  const handleTopUp = (id: string) => {
    // In a real app, this would open a modal to add more LINK
    alert(`Topping up subscription ${id}`);
  };

  const handlePause = (id: string) => {
    setSubscriptions(subs => 
      subs.map(sub => 
        sub.id === id ? { ...sub, status: 'paused' as const } : sub
      )
    );
  };

  const handleResume = (id: string) => {
    setSubscriptions(subs => 
      subs.map(sub => 
        sub.id === id ? { ...sub, status: 'active' as const } : sub
      )
    );
  };

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      setSubscriptions(subs => 
        subs.map(sub => 
          sub.id === id ? { ...sub, status: 'cancelled' as const } : sub
        )
      );
    }
  };

  const handleDeploy = async (deployParams: {
    name: string;
    symbol: string;
    resName: string;
    tokenName: string;
    tokenSymbol: string;
  }): Promise<{
    treasuryTokenAddress: string;
    reserveVaultAddress: string;
  }> => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      // 1. Deploy TreasuryToken contract
      const treasuryTokenAddress = await deployTreasuryToken(
        signer,
        deployParams.name,
        deployParams.symbol
      );
      // 2. Deploy the treasury vault contract
      const { reserveVaultAddress } = await deployReserveVault(
        signer,
        deployParams.resName,
        treasuryTokenAddress,
        deployParams.tokenName,
        deployParams.tokenSymbol
      );
      // 3. Initialize the token with the treasury vault address
      const tokenContract = new ethers.Contract(
        treasuryTokenAddress,
        [
          'function initTreasury(address newOwner) external',
          'function addAuth(address authUser) external'
        ],
        signer
      );
      await tokenContract.initTreasury(reserveVaultAddress);
      // 4. Set the deployed contracts data in state and show the crowdsale modal
      const deploymentData = {
        treasuryTokenAddress,
        treasuryVaultAddress: reserveVaultAddress,
        treasuryTokenSymbol: deployParams.symbol,
        treasuryVaultSymbol: deployParams.tokenSymbol
      };
      // 5. Update UI with the new treasury
      const newTreasury: Treasury = {
        id: Math.max(0, ...treasuries.map((r: Treasury) => r.id)) + 1,
        treasuryName: deployParams.resName,
        contractAddress: reserveVaultAddress,
        tokenSymbol: deployParams.symbol,
        proposalTokenSymbol: 'p' + deployParams.symbol,
        totalValueLocked: '$0',
        apy: '0%',
        isJoined: false,
        openProposals: 0,
        closedProposals: 0,
        totalMembers: 1,
        ownerAddress: await signer.getAddress(),
        authorizedUsers: [],
        treasuryTokenBalance: '0',
        proposalTokenBalance: '0',
        yourStake: '0'
      };
      setTreasuries([...treasuries, newTreasury]);
      setDeployedContracts(deploymentData);
      setShowCrowdsaleModal(true);
      setShowCreateTreasuryModal(false);
      setNotifications((prev: Notification[]) => [
        {
          id: Date.now(),
          title: 'Treasury Created',
          message: `Treasury "${deployParams.resName}" deployed at ${reserveVaultAddress}`,
          time: new Date().toLocaleTimeString(),
          read: false
        },
        ...prev
      ]);
      return {
        treasuryTokenAddress,
        reserveVaultAddress: reserveVaultAddress
      };
    } catch (error) {
      console.error('Error deploying contracts:', error);
      throw error;
    }
  };
  
  const handleLaunchCrowdsale = useCallback(async (ratio: number): Promise<void> => {
    try {
      if (!deployedContracts) return;
      
      // In a real app, you would deploy the crowdsale contract here
      console.log('Launching crowdsale with ratio:', ratio);
      console.log('Token address:', deployedContracts.treasuryTokenAddress);
      console.log('Vault address:', deployedContracts.treasuryVaultAddress);
      
      // Mock deployment - in a real app, this would be an actual contract deployment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update UI or show success message
      setNotifications((prev: Notification[]) => [
        {
          id: Date.now(),
          title: 'Crowdsale Launched',
          message: `Crowdsale launched with ratio ${ratio} for treasury`,
          time: new Date().toLocaleTimeString(),
          read: false
        },
        ...prev
      ]);
      
      // Close the modal
      setShowCrowdsaleModal(false);
    } catch (error) {
      console.error('Error launching crowdsale:', error);
      // Show error notification
      setNotifications((prev: Notification[]) => [
        {
          id: Date.now(),
          title: 'Crowdsale Launch Failed',
          message: 'Failed to launch crowdsale. Please try again.',
          time: new Date().toLocaleTimeString(),
          read: false
        },
        ...prev
      ]);
      throw error;
    }
  }, [deployedContracts]);

  const closeNotifications = useCallback((): void => {
    setShowNotifications(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notifications-widget') && !target.closest('.notifications-btn')) {
        closeNotifications();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, closeNotifications]);

  const togglePreferences = useCallback((): void => {
    setShowPreferences((prev: boolean) => !prev);
  }, []);

  const toggleNotifications = useCallback((): void => {
    setShowNotifications((prev: boolean) => {
      if (!prev) {
        setNotifications((currentNotifications: Notification[]) => 
          currentNotifications.map((notification: Notification) => ({
            ...notification,
            read: true
          }))
        );
      }
      return !prev;
    });
  }, []);

  return (
    <div className="dashboard-container">
      <main className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="dashboard-actions" style={{ display: 'flex', gap: '10px' }}>
            <Link to="/treasuries/find" className="btn primary">
              Find a Treasury
            </Link>
          </div>
        </div>
        
        <div className="dashboard-grid">
          {/* Balance Card */}
          <div className="widget balance-card">
            <h3>Total Balance</h3>
            <div className="balance-amount">$0.00</div>
          </div>
          
          {/* Quick Actions */}
          <div className="widget quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <Link to="/treasuries#joined" className="btn secondary">Joined Treasuries</Link>
              <button 
                className="btn secondary" 
                onClick={() => setShowCreateTreasuryModal(true)}
              >
                Create A Treasury
              </button>
              <button 
                className="btn secondary notifications-btn"
                onClick={toggleNotifications}
              >
                Notifications
                {notifications.some(n => !n.read) && (
                  <span className="notification-badge"></span>
                )}
              </button>
              <button className="btn secondary" onClick={togglePreferences}>
                Preferences
              </button>
            </div>
          </div>
          
          {/* Chainlink Subscriptions */}
          <div className="widget chainlink-subscriptions">
            <h3>Chainlink Subscriptions</h3>
            <ChainlinkSubscriptions 
              subscriptions={subscriptions}
              onTopUp={handleTopUp}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
            />
          </div>
          
          {/* Recent Activity */}
          <div className="widget recent-activity">
            <style jsx>{`
              .recent-activity .activity-list {
                margin-top: 1rem;
              }
              
              .activity-item {
                display: flex;
                padding: 0.75rem 0;
                border-bottom: 1px solid #edf2f7;
                align-items: flex-start;
              }
              
              .activity-item:last-child {
                border-bottom: none;
              }
              
              .activity-icon {
                width: 2rem;
                height: 2rem;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 0.75rem;
                flex-shrink: 0;
                color: white;
                font-weight: bold;
              }
              
              .activity-icon.deposit { background-color: #10b981; }
              .activity-icon.withdrawal { background-color: #ef4444; }
              .activity-icon.execution { background-color: #3b82f6; }
              .activity-icon.status { background-color: #f59e0b; }
              
              .activity-details {
                flex: 1;
                min-width: 0;
              }
              
              .activity-title {
                display: flex;
                flex-wrap: wrap;
                gap: 0.25rem;
                margin-bottom: 0.25rem;
                font-size: 0.875rem;
                color: #1a202c;
              }
              
              .subscription-name {
                font-weight: 600;
                color: #4f46e5;
              }
              
              .event-details {
                color: #4b5563;
              }
              
              .activity-meta {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-size: 0.75rem;
                color: #6b7280;
              }
              
              .activity-amount {
                font-weight: 500;
              }
              
              .activity-amount.deposit {
                color: #10b981;
              }
              
              .activity-amount.withdrawal {
                color: #ef4444;
              }
              
              .activity-time {
                color: #9ca3af;
              }
              
              .no-activity {
                text-align: center;
                padding: 2rem;
                color: #9ca3af;
                font-style: italic;
              }
              
              /* Scrollbar styling */
              .activity-list::-webkit-scrollbar {
                width: 6px;
              }
              
              .activity-list::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
              }
              
              .activity-list::-webkit-scrollbar-thumb {
                background: #cbd5e0;
                border-radius: 3px;
              }
              
              .activity-list::-webkit-scrollbar-thumb:hover {
                background: #a0aec0;
              }
            `}</style>
            <h3>Recent Activity</h3>
            <div className="activity-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {subscriptions
                .flatMap(subscription => 
                  (subscription.events || []).map((event, index) => ({
                    ...event,
                    id: `${subscription.id}-${index}`,
                    subscriptionName: subscription.name
                  }))
                )
                .filter(event => event) // Remove any undefined events
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 5) // Show only 5 most recent events
                .map(event => {
                const getEventIcon = () => {
                  switch(event.type) {
                    case 'topup':
                      return <div className="activity-icon deposit">+</div>;
                    case 'withdrawal':
                      return <div className="activity-icon withdrawal">-</div>;
                    case 'execution':
                      return <div className="activity-icon execution">✓</div>;
                    case 'status_change':
                      return <div className="activity-icon status">!</div>;
                    default:
                      return <div className="activity-icon">•</div>;
                  }
                };

                const formatTimeAgo = (timestamp: string) => {
                  const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
                  
                  let interval = Math.floor(seconds / 31536000);
                  if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
                  
                  interval = Math.floor(seconds / 2592000);
                  if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
                  
                  interval = Math.floor(seconds / 86400);
                  if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
                  
                  interval = Math.floor(seconds / 3600);
                  if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
                  
                  interval = Math.floor(seconds / 60);
                  if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
                  
                  return 'Just now';
                };

                return (
                  <div key={event.id} className="activity-item">
                    <div className="activity-icon">
                      {getEventIcon()}
                    </div>
                    <div className="activity-details">
                      <div className="activity-title">
                        <span className="subscription-name">{event.subscriptionName}</span>
                        <span className="event-details">{event.details}</span>
                      </div>
                      <div className="activity-meta">
                        {event.amount && (
                          <span className={`activity-amount ${
                            event.type === 'withdrawal' ? 'withdrawal' : 'deposit'
                          }`}>
                            {event.amount}
                          </span>
                        )}
                        <span className="activity-time">
                          {formatTimeAgo(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {subscriptions.every(sub => !sub.events?.length) && (
                <div className="no-activity">
                  No recent activity found
                </div>
              )}
            </div>
          </div>
          
          {/* Accepted Proposals Activity */}
          <div className="widget accepted-proposals">
            <h3>Accepted Proposals</h3>
            <div className="proposals-list">
              {acceptedProposals.length === 0 ? (
                <div className="no-proposals">
                  <p>No accepted proposals yet</p>
                  <p className="small">Vote on proposals to see them here</p>
                </div>
              ) : (
                acceptedProposals.map(proposal => {
                  const treasury = treasuries.find(r => r.id === proposal.treasuryId);
                  const treasuryName = treasury ? treasury.treasuryName : 'Unknown Treasury';
                  
                  return (
                    <Link 
                      key={proposal.id} 
                      to={`/treasuries/${proposal.treasuryId}/proposals`}
                      className="proposal-item"
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <div className="proposal-content">
                        <div>
                          <div className="proposal-title">{proposal.title}</div>
                          <div className="proposal-treasury" style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                            {treasuryName}
                          </div>
                        </div>
                        <div className="proposal-details">
                          <div className="proposal-status">
                            <span className={`status-badge ${proposal.status}`}>
                              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                            </span>
                          </div>
                          <div className="proposal-stats">
                            <div className="stat-item">
                              <div className="stat-label">24Hr</div>
                              <div className="stat-value positive">2.5%</div>
                            </div>
                            <div className="stat-item">
                              <div className="stat-label">1M</div>
                              <div className="stat-value negative">-1.2%</div>
                            </div>
                            <div className="stat-item">
                              <div className="stat-label">Days Left</div>
                              <div className="stat-value">
                                {proposal.endDate ? Math.ceil((Date.parse(proposal.endDate) - Date.now()) / (1000 * 60 * 60 * 24)) : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Active Loans */}
          <div className="widget active-loans">
            <h3>Active Treasuries</h3>
            <div className="loans-count">0</div>
            <div className="loans-amount">$0.00</div>
          </div>
          

        </div>
      </main>
      
      <CreateTreasuryModal 
        isOpen={showCreateTreasuryModal}
        onClose={() => setShowCreateTreasuryModal(false)}
        onDeploy={handleDeploy}
      />
      
      {/* Notifications Panel */}
      <div className={`overlay ${showNotifications ? 'visible' : ''}`} onClick={closeNotifications}></div>
      <div className={`notifications-widget ${showNotifications ? 'open' : ''}`}>
        <div className="notifications-header">
          <h3>Notifications</h3>
          <button className="close-notifications" onClick={closeNotifications}>
            &times;
          </button>
        </div>
        <div className="notifications-list">
          {notifications.length === 0 ? (
            <div className="notification-item">
              <p>No new notifications</p>
            </div>
          ) : (
            notifications.map(notification => (
              <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <div className="notification-time">{notification.time}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {showPreferences && (
        <div className="modal-overlay" onClick={togglePreferences}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Preferences</h3>
              <button className="close-button" onClick={togglePreferences}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="preference-item">
                <label>
                  <input type="checkbox" /> Dark Mode
                </label>
              </div>
              <div className="preference-item">
                <label>
                  <input type="checkbox" /> Email Notifications
                </label>
              </div>
              <div className="preference-item">
                <label>
                  <input type="checkbox" /> Push Notifications
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn primary" onClick={togglePreferences}>Save</button>
                <button className="btn secondary" onClick={togglePreferences}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Crowdsale Launch Modal */}
      {showCrowdsaleModal && deployedContracts && (
        <CrowdsaleModal
          isOpen={showCrowdsaleModal}
          onClose={() => setShowCrowdsaleModal(false)}
          onLaunch={handleLaunchCrowdsale}
          treasuryTokenAddress={deployedContracts.treasuryTokenAddress}
          reserveVaultAddress={deployedContracts.treasuryVaultAddress}
          treasuryTokenSymbol={deployedContracts.treasuryTokenSymbol}
          reserveVaultSymbol={deployedContracts.treasuryVaultSymbol}
        />
      )}
    </div>
  );
};

export default Dashboard;
