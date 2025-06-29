import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockTreasuries } from '../mocks/treasuries';
import type { Treasury } from '../mocks/treasuries';
import CreateTreasuryModal from '../components/CreateTreasuryModal';
import JoinTreasuryModal from '../components/JoinTreasuryModal';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ethers } from 'ethers';
import styles from './FindTreasuries.module.css';

// Extend the Treasury type to include additional properties
interface ExtendedTreasury extends Omit<Treasury, 'totalMembers'> {
  memberCount: number;
  totalMembers: number;
}

interface TreasuryModalProps {
  treasury: Treasury | null;
  onClose: () => void;
  onJoin: (amount: string) => Promise<number>;
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const TreasuryModal: React.FC<TreasuryModalProps> = ({ treasury, onClose, onJoin }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  
  if (!treasury) return null;

  const treasuryBalance = parseFloat(treasury.treasuryTokenBalance.split(' ')[0].replace(/,/g, '')) || 0;
  const proposalBalance = parseFloat(treasury.proposalTokenBalance.split(' ')[0].replace(/,/g, '')) || 0;
  
  const handlePrevUser = () => {
    setCurrentUserIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNextUser = () => {
    setCurrentUserIndex(prev => Math.min(treasury.authorizedUsers.length - 1, prev + 1));
  };
  
  const currentUser = treasury.authorizedUsers[currentUserIndex];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Treasury Details</h3>
          <button className={styles.modalClose} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.treasuryDetail}>
            <div className={`${styles.treasuryIcon} ${styles.large}`}>
              {treasury.tokenSymbol.substring(0, 2).toUpperCase()}
            </div>
            <h2 className={styles.treasuryName}>{treasury.tokenSymbol} Treasury</h2>
            
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Total Value Locked</span>
              <span className={styles.detailValue}>{treasury.totalValueLocked}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Contract</span>
              <div className={styles.detailValue}>
                <span className={styles.truncate}>{formatAddress(treasury.contractAddress)}</span>
                <ContentCopyIcon 
                  className={styles.copyIcon}
                  onClick={() => copyToClipboard(treasury.contractAddress)}
                  sx={{ 
                    fontSize: 16, 
                    cursor: 'pointer',
                    color: 'var(--text-light)',
                    '&:hover': { color: 'var(--primary)' },
                    marginLeft: '0.5rem'
                  }}
                />
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Owner</span>
              <div className={styles.detailValue}>
                <span className={styles.truncate}>{formatAddress(treasury.ownerAddress)}</span>
                <ContentCopyIcon 
                  className={styles.copyIcon}
                  onClick={() => copyToClipboard(treasury.ownerAddress)}
                  sx={{ 
                    fontSize: 16, 
                    cursor: 'pointer',
                    color: 'var(--text-light)',
                    '&:hover': { color: 'var(--primary)' },
                    marginLeft: '0.5rem'
                  }}
                />
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Authorized Users</span>
              <div className={styles.authorizedUserList}>
                {currentUser && (
                  <div className={styles.authorizedUser}>
                    <span className={styles.truncate} title={currentUser}>
                      {formatAddress(currentUser)}
                    </span>
                    <ContentCopyIcon 
                      onClick={() => copyToClipboard(currentUser)}
                      sx={{ 
                        fontSize: 16, 
                        cursor: 'pointer',
                        color: 'var(--text-light)',
                        marginLeft: '0.5rem',
                        '&:hover': {
                          color: 'var(--primary)'
                        }
                      }}
                    />
                  </div>
                )}
                <div className={styles.authorizedNavigation}>
                  <button 
                    className={styles.navButton} 
                    onClick={handlePrevUser}
                    disabled={currentUserIndex === 0}
                    aria-label="Previous user"
                  >
                    <ArrowBackIcon fontSize="small" />
                  </button>
                  <span className={styles.pageIndicator}>
                    {currentUserIndex + 1} of {treasury.authorizedUsers.length}
                  </span>
                  <button 
                    className={styles.navButton} 
                    onClick={handleNextUser}
                    disabled={currentUserIndex === treasury.authorizedUsers.length - 1}
                    aria-label="Next user"
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Open Proposals</span>
              <span className={styles.detailValue}>{treasury.openProposals}</span>
            </div>
            
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Closed Proposals</span>
              <span className={styles.detailValue}>{treasury.closedProposals}</span>
            </div>
            
            <div className={styles.tokenBalance}>
              <div className={styles.tokenInfo}>
                <span className={styles.detailLabel}>Treasury Token</span>
                <span className={styles.tokenAmount}>{treasury.treasuryTokenBalance}</span>
              </div>
              <div className={styles.tokenActions}>
                <button 
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={() => {}}
                >
                  <ArrowBackIcon sx={{ fontSize: 16, marginRight: '4px' }} /> Receive
                </button>
                <button 
                  className={`${styles.button} ${styles.buttonPrimary} ${treasuryBalance <= 0 ? styles.disabled : ''}`}
                  disabled={treasuryBalance <= 0}
                  onClick={() => {}}
                >
                  Send <ArrowForwardIcon sx={{ fontSize: 16, marginLeft: '4px' }} />
                </button>
              </div>
            </div>
            
            <div className={styles.tokenBalance}>
              <div className={styles.tokenInfo}>
                <span className={styles.detailLabel}>Proposal Token</span>
                <span className={styles.tokenAmount}>{treasury.proposalTokenBalance}</span>
              </div>
              <div className={styles.tokenActions}>
                <button 
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  onClick={() => {}}
                >
                  <ArrowBackIcon sx={{ fontSize: 16, marginRight: '4px' }} /> Receive
                </button>
                <button 
                  className={`${styles.button} ${styles.buttonPrimary} ${proposalBalance <= 0 ? styles.disabled : ''}`}
                  disabled={proposalBalance <= 0}
                  onClick={() => {}}
                >
                  Send <ArrowForwardIcon sx={{ fontSize: 16, marginLeft: '4px' }} />
                </button>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              {treasury.isJoined && (
                <button 
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  onClick={() => onClose()}
                >
                  Create Proposal
                </button>
              )}
              
              <button 
                className={`${styles.button} ${treasury.isJoined ? styles.buttonDanger : styles.buttonPrimary}`}
                onClick={async () => {
                  try {
                    await onJoin('1');
                    onClose();
                  } catch (error) {
                    console.error('Error joining treasury:', error);
                  }
                }}
              >
                {treasury.isJoined ? 'Leave Treasury' : 'Join Treasury'}
              </button>
              
              <Link 
                to={`/treasuries/${treasury.id}/proposals`}
                className={`${styles.button} ${styles.buttonSecondary}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                View Proposals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FindTreasuries: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [treasuries, setTreasuries] = useState<ExtendedTreasury[]>(
    mockTreasuries.map(t => ({
      ...t,
      memberCount: t.totalMembers || 1,
      totalMembers: t.totalMembers || 1
    } as ExtendedTreasury))
  );
  const [activeTab, setActiveTab] = useState<'all' | 'joined'>('all');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTreasury, setSelectedTreasury] = useState<ExtendedTreasury | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle info click
  const handleInfoClick = (treasury: ExtendedTreasury) => {
    setSelectedTreasury(treasury);
    setShowModal(true);
  };

  // Handle join button click
  const handleJoinClick = (treasuryId: number) => {
    const treasury = treasuries.find(t => t.id === treasuryId);
    if (treasury) {
      setSelectedTreasury(treasury);
      setShowJoinModal(true);
    }
  };

  // Handle joining a treasury with amount
  const handleJoinTreasury = async (amount: string): Promise<number> => {
    if (!selectedTreasury) return 0;
    
    setIsLoading(true);
    try {
      // Simulate API call and return a mock escrow ID
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the treasury's joined status and member count
      setTreasuries(prev => 
        prev.map(t => 
          t.id === selectedTreasury.id 
            ? { 
                ...t, 
                isJoined: true,
                memberCount: (t.memberCount || 0) + 1,
                totalMembers: (t.totalMembers || 1) + 1
              } 
            : t
        )
      );
      setShowJoinModal(false);
      return Math.floor(Math.random() * 1000); // Mock escrow ID
    } catch (error) {
      console.error('Failed to join treasury:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Filter treasuries based on search term and active tab
  const filteredTreasuries = useMemo(() => {
    let result = [...treasuries];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(treasury => 
        treasury.treasuryName.toLowerCase().includes(term) ||
        treasury.tokenSymbol.toLowerCase().includes(term) ||
        treasury.contractAddress.toLowerCase().includes(term)
      );
    }
    
    // Filter by joined status if needed
    if (activeTab === 'joined') {
      result = result.filter(treasury => treasury.isJoined);
    }
    
    return result;
  }, [treasuries, searchTerm, activeTab]);

  // Fetch treasuries from backend API and merge with mock data
  useEffect(() => {
    const fetchTreasuries = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/treasuries');
        const apiTreasuries: Treasury[] = await response.json();
        
        // Merge backend treasuries with mockTreasuries (avoid duplicates by contractAddress)
        const merged: ExtendedTreasury[] = [...mockTreasuries.map(t => ({
          ...t,
          memberCount: t.totalMembers || 1,
          totalMembers: t.totalMembers || 1
        }))];
        
        apiTreasuries.forEach((apiTreasury) => {
          if (!merged.some(m => m.contractAddress === apiTreasury.contractAddress)) {
            merged.push({
              ...apiTreasury,
              memberCount: apiTreasury.totalMembers || 1,
              totalMembers: apiTreasury.totalMembers || 1
            } as ExtendedTreasury);
          }
        });
        
        setTreasuries(merged);
      } catch (error) {
        console.error('Failed to fetch treasuries:', error);
        // Fallback to mock data with memberCount
        setTreasuries(mockTreasuries.map(t => ({
          ...t,
          memberCount: t.totalMembers || 1,
          totalMembers: t.totalMembers || 1
        } as ExtendedTreasury)));
      }
    };
    
    fetchTreasuries();
  }, []);
  
  // Handle hash-based tab selection
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#joined') {
        setActiveTab('joined');
      } else {
        setActiveTab('all');
      }
    };

    // Check initial hash
    handleHashChange();

    // Add hash change listener
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Find Treasuries</h1>
        <div className={styles.actions}>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
          >
            Create Treasury
          </button>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name, symbol, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Treasuries
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'joined' ? styles.active : ''}`}
            onClick={() => setActiveTab('joined')}
          >
            My Treasuries
          </button>
        </div>
      </div>

      <div className={styles.treasuryList}>
        {filteredTreasuries.map((treasury) => (
          <div key={treasury.id} className={styles.treasuryCard}>
            <div className={styles.treasuryHeader}>
              <div className={styles.treasuryIcon}>
                {treasury.tokenSymbol.substring(0, 2).toUpperCase()}
              </div>
              <div className={styles.treasuryInfo}>
                <h3>{treasury.treasuryName}</h3>
                <p>{treasury.tokenSymbol}</p>
              </div>
              <div className={styles.treasuryValue}>
                {treasury.totalValueLocked}
              </div>
            </div>
            <div className={styles.treasuryDetails}>
              <div className={styles.detailItem}>
                <span>Members</span>
                <span>{treasury.memberCount} / {treasury.totalMembers}</span>
              </div>
              <div className={styles.detailItem}>
                <span>Proposals</span>
                <span>{treasury.openProposals} Open • {treasury.closedProposals} Closed</span>
              </div>
            </div>
            <div className={styles.treasuryActions}>
              <button 
                className={styles.infoButton}
                onClick={() => handleInfoClick(treasury)}
              >
                Info
              </button>
              {!treasury.isJoined ? (
                <button 
                  className={styles.joinButton}
                  onClick={() => handleJoinClick(treasury.id)}
                >
                  Join
                </button>
              ) : (
                <Link 
                  to={`/treasuries/${treasury.id}`}
                  className={styles.viewButton}
                >
                  View
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedTreasury && (
        <TreasuryModal
          treasury={selectedTreasury}
          onClose={() => setShowModal(false)}
          onJoin={handleJoinTreasury}
        />
      )}

      {showJoinModal && selectedTreasury && (
        <JoinTreasuryModal
          isOpen={showJoinModal}
          treasuryAddress={selectedTreasury.contractAddress}
          treasuryName={selectedTreasury.treasuryName}
          onClose={() => setShowJoinModal(false)}
          onSuccess={() => {
            // Refresh the treasuries list or show success message
            setShowJoinModal(false);
            // You might want to add a success toast or notification here
          }}
        />
      )}

      {showCreateModal && (
        <CreateTreasuryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onDeploy={async (deploymentData) => {
            // Simulate deployment
            const result = {
              treasuryTokenAddress: '0x' + Math.random().toString(16).substr(2, 40),
              reserveVaultAddress: '0x' + Math.random().toString(16).substr(2, 40)
            };
            
            // Create new treasury object
            const newTreasury: ExtendedTreasury = {
              id: Math.max(...treasuries.map(t => t.id), 0) + 1,
              treasuryName: deploymentData.resName,
              tokenSymbol: deploymentData.symbol,
              proposalTokenSymbol: `p${deploymentData.symbol}`,
              totalValueLocked: '0',
              contractAddress: result.treasuryTokenAddress,
              ownerAddress: '', // This should be set to the current user's address
              authorizedUsers: [],
              isJoined: true,
              treasuryTokenBalance: '0',
              proposalTokenBalance: '0',
              openProposals: 0,
              closedProposals: 0,
              memberCount: 1,
              totalMembers: 1
            };
            
            // Add the new treasury to the list
            setTreasuries(prev => [...prev, newTreasury]);
            setShowCreateModal(false);
            
            return result;
          }}
        />
      )}
    </div>
  );
};

export default FindTreasuries;
