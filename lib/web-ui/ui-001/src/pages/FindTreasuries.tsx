import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockTreasuries } from '../mocks/treasuries';
import type { Treasury } from '../mocks/treasuries';
import CreateTreasuryModal from '../components/CreateTreasuryModal';
import JoinTreasuryModal from '../components/JoinTreasuryModal';
import CreateProposalModal from '../components/CreateProposalModal';
import { Web3Provider } from '@ethersproject/providers';
import { getTokenSupply, getTreasuryTokenAddress, getTokenDetails } from '../utils/tokenUtils';
import TreasuryVaultABI from '../abis/TreasuryVault.json';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ethers } from 'ethers';
import { useDataMode } from '../contexts/DataModeContext';
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
  onCreateProposal: () => void;
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

const formatAddress = (address: string) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

const TreasuryModal: React.FC<TreasuryModalProps> = ({ treasury, onClose, onJoin, onCreateProposal }) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [tokenDetails, setTokenDetails] = useState<{
    name: string;
    symbol: string;
    totalSupply: string;
    owner: string;
    tokenAddress: string;
  }>({
    name: '',
    symbol: '',
    totalSupply: '0',
    owner: '',
    tokenAddress: ''
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchTokenDetails = async () => {
      if (!treasury?.contractAddress) return;
      
      try {
        setIsLoading(true);
        // @ts-ignore - ethereum is injected by the wallet
        const provider = new Web3Provider(window.ethereum);
        
        // Get the token address from the treasury vault
        const tokenAddress = await getTreasuryTokenAddress(treasury.contractAddress, provider);
        
        if (tokenAddress) {
          // Get token details from the TreasuryToken contract
          const details = await getTokenDetails(tokenAddress, provider);
          
          setTokenDetails({
            ...details,
            tokenAddress
          });
        }
      } catch (error) {
        console.error('Failed to fetch token details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTokenDetails();
  }, [treasury?.contractAddress]);
  
  if (!treasury) return null;

  const treasuryBalance = parseFloat(treasury.treasuryTokenBalance.split(' ')[0].replace(/,/g, '')) || 0;
  const proposalBalance = parseFloat(treasury.proposalTokenBalance.split(' ')[0].replace(/,/g, '')) || 0;
  
  // Extract token symbol and name from treasury data
  const tokenSymbol = tokenDetails.symbol || treasury.tokenSymbol || 'JIM';
  const tokenName = tokenDetails.name || treasury.treasuryName || 'Jimster';
  
  const handlePrevUser = () => {
    setCurrentUserIndex(prev => Math.max(0, prev - 1));
  };
  
  const handleNextUser = () => {
    setCurrentUserIndex(prev => Math.min(treasury.authorizedUsers.length - 1, prev + 1));
  };
  
  const currentUser = treasury.authorizedUsers[currentUserIndex];
  
  // Format address with copy button
  const renderAddress = (address: string) => (
    <div className={styles.addressWithCopy}>
      <span className={styles.truncate}>{address}</span>
      <ContentCopyIcon 
        className={styles.copyIcon}
        onClick={() => copyToClipboard(address)}
        sx={{ 
          fontSize: 16, 
          cursor: 'pointer',
          color: 'var(--text-light)',
          '&:hover': { color: 'var(--primary)' },
          marginLeft: '0.5rem'
        }}
      />
    </div>
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Treasury Details</h3>
          <button className={styles.modalClose} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.treasuryDetail}>
            <h2 className={styles.treasuryName}>{treasury.treasuryName || 'Treasury'}</h2>
            
            {/* Token Details Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}> Treasury Details </h3>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Treasury Name:</span>
                <span className={styles.detailValue}>{tokenName}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Treasury Token Symbol:</span>
                <span className={styles.detailValue}>{tokenSymbol}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Current Supply:</span>
                <span className={styles.detailValue}>
                  {isLoading ? 'Loading...' : parseInt(tokenDetails.totalSupply).toLocaleString()}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Owner:</span>
                <div className={styles.detailValue}>
                  {renderAddress(tokenDetails.owner || treasury.ownerAddress)}
                </div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Token Address:</span>
                <div className={styles.detailValue}>
                  {renderAddress(tokenDetails.tokenAddress)}
                </div>
              </div>
            </div>
            
            {/* Vault Details Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}> Reserve Details </h3>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Token Address:</span>
                <div className={styles.detailValue}>
                  {renderAddress(treasury.contractAddress)}
                </div>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Reserve Token Name:</span>
                <span className={styles.detailValue}>{treasury.treasuryName}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Reserve Token Symbol:</span>
                <span className={styles.detailValue}>{tokenSymbol}</span>
              </div>
            </div>
            
            {/* Token-Vault Connection Section */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}> Treasury Stats </h3>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Supported Tokens:</span>
                <span className={styles.detailValue}>
                  {isLoading ? 'Loading...' : treasuryBalance.toLocaleString()}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Tokens in Treasury:</span>
                <span className={styles.detailValue}>
                  {isLoading ? 'Loading...' : proposalBalance.toLocaleString()}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Tokens Withdrawn:</span>
                <span className={styles.detailValue}>
                  {isLoading ? 'Loading...' : parseInt(tokenDetails.totalSupply).toLocaleString()}
                </span>
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
                <span className={styles.detailLabel}>Reserve Token</span>
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
                  onClick={onCreateProposal}
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
  const { useLiveData } = useDataMode();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [treasuries, setTreasuries] = useState<ExtendedTreasury[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'joined'>('all');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedTreasury, setSelectedTreasury] = useState<ExtendedTreasury | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [showCreateProposalModal, setShowCreateProposalModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMorePages, setHasMorePages] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Initialize treasuries based on data mode
  useEffect(() => {
    if (!useLiveData) {
      setTreasuries(mockTreasuries.map(t => ({
        ...t,
        memberCount: t.totalMembers || 1,
        totalMembers: t.totalMembers || 1
      } as ExtendedTreasury)));
      setIsLoading(false);
      setHasMorePages(false);
      setCurrentPage(1);
    } else {
      setTreasuries([]);
      setCurrentPage(1);
      setHasMorePages(true);
      fetchTreasuries();
    }
  }, [useLiveData]);

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

  // Handle creating a proposal
  const handleCreateProposal = async (proposalData: {
    type: string;
    description: string;
    amount?: string;
    receiver?: string;
    tokenAddress?: string;
    poolAddress?: string;
    votingType: 'ratio' | 'totalSupply';
  }): Promise<void> => {
    if (!selectedTreasury) return;

    setIsLoading(true);
    try {
      // The proposal creation is now handled in the CreateProposalModal
      // This callback is just for any additional UI updates
      console.log('Proposal created successfully:', proposalData);

      // Close the modal
      setShowCreateProposalModal(false);
    } catch (error) {
      console.error('Failed to create proposal:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort treasuries
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
    
    // Sort treasuries - zJimster first, then by name
    return result.sort((a, b) => {
      // zJimster treasury always comes first
      if (a.treasuryName === 'zJimster Treasury') return -1;
      if (b.treasuryName === 'zJimster Treasury') return 1;
      
      // Then sort by name
      return a.treasuryName.localeCompare(b.treasuryName);
    });
  }, [treasuries, searchTerm, activeTab]);

  // Fetch treasuries from the deployed-treasuries API
  const fetchTreasuries = async (page: number = 1, append: boolean = false) => {
    // If not using live data, skip the API call
    if (!useLiveData) {
      if (!append) {
        setIsLoading(false);
        setHasMorePages(false);
      } else {
        setLoadingMore(false);
      }
      return;
    }

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      // Fetch from our new deployed-treasuries endpoint with pagination
      const response = await fetch(`http://localhost:4000/api/deployed-treasuries?page=${page}&limit=10`);
      const data = await response.json();
      
      // Transform the data to match the Treasury interface
      const transformedTreasuries: ExtendedTreasury[] = await Promise.all(data.treasuries.map(async (treasury: any, index: number) => {
        let treasuryName = treasury.name; // Default to API name
        
        // Try to get treasury name from smart contract
        try {
          if (window.ethereum) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(treasury.vaultAddress, TreasuryVaultABI.abi, provider);
            const contractName = await contract.treasuryName();
            if (contractName && contractName.trim()) {
              treasuryName = contractName;
            }
          }
        } catch (error) {
          console.warn(`Failed to fetch treasury name from contract ${treasury.vaultAddress}:`, error);
          // Keep the API name as fallback
        }
        
        return {
          id: (page - 1) * 10 + index + 1, // Generate a unique ID based on page
          treasuryName,
          contractAddress: treasury.vaultAddress, // Using vault address as the main contract address
          tokenSymbol: treasury.tokenSymbol,
          proposalTokenSymbol: `p${treasury.tokenSymbol}`,
          totalValueLocked: '$0.00', // Will be updated from the blockchain
          apy: '0.0%',
          isJoined: false, // Will be updated based on user's membership
          openProposals: 0, // Will be updated from the blockchain
          closedProposals: 0, // Will be updated from the blockchain
          totalMembers: 1, // Will be updated from the blockchain
          memberCount: 1, // Will be updated from the blockchain
          yourStake: '0.0', // Will be updated from the blockchain
          ownerAddress: treasury.ownerAddress,
          authorizedUsers: [], // Will be updated from the blockchain
          treasuryTokenBalance: '0.0', // Will be updated from the blockchain
          proposalTokenBalance: '0.0' // Will be updated from the blockchain
        } as ExtendedTreasury;
      }));
      
      if (append) {
        setTreasuries(prev => [...prev, ...transformedTreasuries]);
        setHasMorePages(data.pagination.hasNextPage);
        setCurrentPage(page);
      } else {
        setTreasuries(transformedTreasuries);
        setHasMorePages(data.pagination.hasNextPage);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch deployed treasuries:', error);
      // In live mode, don't fallback to mock data - show empty list
      if (!append) {
        setTreasuries([]);
        setHasMorePages(false);
      }
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

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
              <div className={styles.treasuryInfo}>
                <h3>{treasury.treasuryName}</h3>
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
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMorePages && (
        <div className={styles.loadMoreContainer}>
          <button
            className={styles.loadMoreButton}
            onClick={() => fetchTreasuries(currentPage + 1, true)}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading...' : 'Load More Treasuries'}
          </button>
        </div>
      )}

      {showModal && selectedTreasury && (
        <TreasuryModal
          treasury={selectedTreasury}
          onClose={() => setShowModal(false)}
          onJoin={handleJoinTreasury}
          onCreateProposal={() => setShowCreateProposalModal(true)}
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

      {showCreateProposalModal && selectedTreasury && (
        <CreateProposalModal
          isOpen={showCreateProposalModal}
          treasuryAddress={selectedTreasury.contractAddress}
          treasuryName={selectedTreasury.treasuryName}
          lendingContractAddress={selectedTreasury.lendingContractAddress}
          onClose={() => setShowCreateProposalModal(false)}
          onCreateProposal={handleCreateProposal}
        />
      )}
    </div>
  );
};

export default FindTreasuries;
