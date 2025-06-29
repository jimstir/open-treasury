import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { mockProposals } from '../mocks/proposals';
import { mockTreasuries } from '../mocks/treasuries';
import type { Treasury } from '../mocks/treasuries';
import '../App.css';

interface Proposal {
  id: number;
  title: string;
  description: string;
  status: string;
  createdDate: string;
  closedDate: string | null;
  votesFor: number;
  votesAgainst: number;
  hasVoted: boolean;
  voteType?: 'accept' | 'reject';
  contractAddress: string;
  treasuryId: number;
  ownerApproved?: boolean;
  formData?: ProposalFormData; // Add formData to store the form inputs
}

interface ProposalTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: string) => void;
  treasuryId?: string;
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
}

interface ProposalFormData {
  description: string;
  amount?: string;
  priceRatio?: string;
  voteApprovalPercentage?: string;
  tokenAddress?: string;
  poolAddress?: string;
  duration?: string;
  recipientAddress?: string;
  isSmartContract: boolean;
  contractAddress: string;
}

interface TokenOption {
  value: string;
  label: string;
}

const ProposalTypeModal: React.FC<ProposalTypeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectType,
  treasuryId,
  setProposals 
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProposalFormData>({
    description: '',
    amount: '',
    tokenAddress: '',
    poolAddress: '',
    duration: '',
    recipientAddress: '',
    isSmartContract: false,
    contractAddress: ''
  });

  // Mock contract addresses - replace with actual contract addresses from your app
  const contractAddresses = [
    { value: '0x1234...abcd', label: 'Main Treasury Contract' },
    { value: '0x5678...efgh', label: 'Liquidity Pool Contract' },
    { value: '0x9012...ijkl', label: 'Staking Contract' },
  ];

  // Mock token options - replace with actual tokens from your app
  const tokenOptions: TokenOption[] = [
    { value: '0x1111...aaaa', label: 'USDC' },
    { value: '0x2222...bbbb', label: 'USDT' },
    { value: '0x3333...cccc', label: 'DAI' },
    { value: '0x4444...dddd', label: 'WBTC' }
  ];

  // Mock pool options
  const poolOptions = [
    { value: '0xpool1...1234', label: 'ETH/USDC Pool' },
    { value: '0xpool2...5678', label: 'ETH/USDT Pool' },
    { value: '0xpool3...9012', label: 'ETH/DAI Pool' },
    { value: '0xpool4...3456', label: 'WBTC/ETH Pool' },
  ];

  // Display names for the UI
  const proposalTypes = [
    { display: 'Join a Pool', value: 'Liquidity Pool' },
    { display: 'Collateral Based', value: 'Collateral Based' },
    { display: 'Acquire Asset', value: 'Acquire Asset' },
    { display: 'Treasury Buy Back', value: 'Treasury Buy Back' }
  ] as const;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) return;
    
    let joinPoolAddress = '';
    if (selectedType === 'Liquidity Pool') {
      try {
        const { deployJoinPool } = await import('../blockchain/joinPoolService');
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new (window as any).ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          // TODO: Replace with actual constructor args for JoinPool
          joinPoolAddress = await deployJoinPool(signer /*, ...args */);
        }
      } catch (err) {
        console.error('Failed to deploy JoinPool:', err);
      }
    }
    setProposals((prev: Proposal[]) => {
      const newProposal: Proposal = {
        id: Math.max(0, ...prev.map((p: Proposal) => p.id)) + 1,
        title: `${selectedType} Proposal`,
        description: formData.description || `New ${selectedType} proposal`,
        status: 'active',
        createdDate: new Date().toISOString(),
        closedDate: null,
        votesFor: 0,
        votesAgainst: 0,
        hasVoted: false,
        contractAddress: joinPoolAddress,
        treasuryId: Number(treasuryId),
        formData: { ...formData }
      };
      console.log('Created new proposal:', newProposal);
      return [newProposal, ...prev];
    });
    // Close the modal and reset the form
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedType(null);
    setFormData({
      description: '',
      amount: '',
      tokenAddress: '',
      poolAddress: '',
      duration: '',
      recipientAddress: '',
      isSmartContract: false,
      contractAddress: ''
    });
  };

  if (!isOpen) return null;

  const renderForm = () => {
    if (!selectedType) return null;

    return (
      <form onSubmit={handleSubmit} id="proposal-form" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          {selectedType === 'Liquidity Pool' ? 'Join a Pool' : selectedType}
        </h2>
        
        {selectedType === 'Treasury Buy Back' ? (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="amount" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0"
                step="any"
                placeholder="Enter amount"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '1rem',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text)',
                  marginBottom: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="priceRatio" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Price Ratio</label>
              <input
                type="number"
                id="priceRatio"
                name="priceRatio"
                value={formData.priceRatio || ''}
                onChange={handleInputChange}
                required
                min="0"
                step="0.0001"
                placeholder="Enter price ratio"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '1rem',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text)'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="voteApprovalPercentage" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Vote Approval Percentage</label>
              <input
                type="number"
                id="voteApprovalPercentage"
                name="voteApprovalPercentage"
                value={formData.voteApprovalPercentage || ''}
                onChange={handleInputChange}
                required
                min="0"
                max="100"
                step="0.01"
                placeholder="Enter vote approval percentage"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '1rem',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text)'
                }}
              />
            </div>
          </>
        ) : selectedType === 'Acquire Asset' ? (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="amount" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min="0"
                step="any"
                placeholder="Enter amount"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '1rem',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text)',
                  marginBottom: '1rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="contractAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Address to Send
              </label>
              <input
                type="text"
                id="contractAddress"
                name="contractAddress"
                value={formData.contractAddress}
                onChange={handleInputChange}
                required
                placeholder="Enter contract address"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  fontSize: '1rem',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text)'
                }}
              />
            </div>
          </>
        ) : (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                name="isSmartContract"
                checked={formData.isSmartContract}
                onChange={handleInputChange}
                style={{ width: '1rem', height: '1rem' }}
              />
              Smart Contract Only
            </label>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="contractAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                Address to Send
              </label>
              {formData.isSmartContract ? (
                <select
                  id="contractAddress"
                  name="contractAddress"
                  value={formData.contractAddress}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text)'
                  }}
                >
                  <option value="">Select a contract</option>
                  {contractAddresses.map((contract) => (
                    <option key={contract.value} value={contract.value}>
                      {contract.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id="contractAddress"
                  name="contractAddress"
                  value={formData.contractAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter contract address"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text)'
                  }}
                />
              )}
            </div>
          </div>
        )}

          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="form-textarea"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '1rem',
                marginBottom: '1rem',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
          </div>

          {(selectedType === 'Liquidity Pool' || selectedType === 'Collateral Based') && (
            <>
              {selectedType === 'Liquidity Pool' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="poolAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Pool</label>
                  <select
                    id="poolAddress"
                    name="poolAddress"
                    value={formData.poolAddress}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '1rem',
                      marginBottom: '1rem',
                      backgroundColor: 'var(--card-bg)',
                      color: 'var(--text)'
                    }}
                  >
                    <option value="">Select a pool</option>
                    {poolOptions.map((pool) => (
                      <option key={pool.value} value={pool.value}>
                        {pool.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="tokenAddress" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Token</label>
                <select
                  id="tokenAddress"
                  name="tokenAddress"
                  value={formData.tokenAddress}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text)'
                  }}
                >
                  <option value="">Select a token</option>
                  {tokenOptions.map((token) => (
                    <option key={token.value} value={token.value}>
                      {token.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="duration" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Lock Duration</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="Enter duration in days"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text)'
                  }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="amount" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Amount</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                  }}
                />
              </div>
            </>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => setSelectedType(null)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--text)'
              }}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn primary"
              style={{ flex: 1 }}
            >
              Create Proposal
            </button>
          </div>
      </form>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>{selectedType ? `Create ${selectedType === 'Liquidity Pool' ? 'Join a Pool' : selectedType} Proposal` : 'Create New Proposal'}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {!selectedType ? (
            <div style={{ width: '100%' }}>
              <p style={{ margin: '0 0 1.5rem', color: 'var(--text-light)' }}>
                Select proposal type:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {proposalTypes.map(({ display, value }) => {
                  const isJoinPool = value === 'Liquidity Pool';
                  return (
                    <button
                      key={value}
                      className={`btn ${isJoinPool ? 'primary' : 'disabled'}`}
                      onClick={() => isJoinPool && setSelectedType(value)}
                      disabled={!isJoinPool}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        textAlign: 'left',
                        justifyContent: 'flex-start',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s ease',
                        opacity: isJoinPool ? 1 : 0.6,
                        cursor: isJoinPool ? 'pointer' : 'not-allowed',
                        backgroundColor: isJoinPool ? 'var(--primary)' : 'var(--border)',
                        color: isJoinPool ? 'white' : 'var(--text-light)',
                        border: 'none',
                      }}
                    >
                      {display}
                      {!isJoinPool && (
                        <span style={{
                          fontSize: '0.8rem',
                          marginLeft: '0.5rem',
                          color: 'var(--text-light)',
                          fontStyle: 'italic'
                        }}>
                          (Coming Soon)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            renderForm()
          )}
        </div>
      </div>
    </div>
  );
};

interface ProposalModalProps {
  proposal: Proposal | null;
  onClose: () => void;
  onVote: (proposalId: number, vote: 'accept' | 'reject') => void;
  onAccept?: (proposalId: number, amount: number) => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({ proposal, onClose, onVote, onAccept }) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [proposalTokens, setProposalTokens] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProposalTokens(value);
    
    // Validate input
    if (value === '') {
      setInputError(null);
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setInputError('Amount must be greater than 0');
    } else if (proposal && numValue > proposal.votesFor) {
      setInputError(`Amount cannot exceed ${proposal.votesFor} available tokens`);
    } else {
      setInputError(null);
    }
  };

  const handleAccept = () => {
    if (inputError || !proposalTokens) return;
    if (onAccept) {
      onAccept(proposal!.id, parseFloat(proposalTokens));
    }
  };
  
  const handleCopy = (text: string, type: string) => {
    copyToClipboard(text);
    setCopiedAddress(type);
    setTimeout(() => setCopiedAddress(null), 2000);
  };
  if (!proposal) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      active: 'status-active',
      open: 'status-open',
      pending: 'status-pending',
      closed: 'status-closed',
      executed: 'status-executed',
      rejected: 'status-rejected'
    };
    
    const statusText: { [key: string]: string } = {
      active: 'Active',
      open: 'Open',
      pending: 'Pending',
      closed: 'Closed',
      executed: 'Executed',
      rejected: 'Rejected'
    };
    
    const className = statusClasses[status] || 'status-default';
    const text = statusText[status] || status;
    
    return (
      <span className={`status-badge ${className}`}>
        <span className="status-dot"></span>
        {text}
      </span>
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal treasury-detail-modal" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: '800px' }}>
        <div className="modal-header">
          <h3>Proposal Info</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="treasury-detail" style={{ width: '100%' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', color: 'var(--text)' }}>{proposal.title}</h2>
            
            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                padding: '1rem', 
                background: 'var(--bg-secondary)', 
                borderRadius: '8px',
                color: 'var(--text)',
                lineHeight: 1.6,
                fontSize: '0.95rem'
              }}>
                {proposal.description}
              </div>
            </div>
            
            {/* Status Section */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 1rem', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Status</h4>
              
              <div className="detail-row">
                <span className="detail-label">Current Status</span>
                <div className="detail-value">
                  {getStatusBadge(proposal.status)}
                </div>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Owner Approved</span>
                <div className="detail-value" style={{ color: proposal.ownerApproved ? 'var(--success)' : 'var(--danger)' }}>
                  {proposal.ownerApproved ? '✓' : '✗'}
                </div>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Votes For</span>
                <div className="detail-value" style={{ color: 'var(--success)', fontWeight: 500 }}>
                  {proposal.votesFor} votes
                </div>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Votes Against</span>
                <div className="detail-value" style={{ color: 'var(--danger)', fontWeight: 500 }}>
                  {proposal.votesAgainst} votes
                </div>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <div className="detail-value">
                  {formatDate(proposal.createdDate)}
                </div>
              </div>
              
              {proposal.closedDate && (
                <div className="detail-row">
                  <span className="detail-label">Closed</span>
                  <div className="detail-value">
                    {formatDate(proposal.closedDate)}
                  </div>
                </div>
              )}
              
              <div className="detail-row">
                <span className="detail-label">Contract</span>
                <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {formatAddress(proposal.contractAddress)}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <ContentCopyIcon 
                      className="copy-icon hover-primary"
                      style={{ 
                        fontSize: '1rem', 
                        cursor: 'pointer', 
                        color: 'var(--text-secondary)'
                      }}
                      onClick={() => handleCopy(proposal.contractAddress, 'contract')} 
                    />
                    {copiedAddress === 'contract' && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Copied!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Data Section */}
            {proposal.formData && (
              <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 1rem', color: 'var(--text)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Proposal Details</h4>
                
                {proposal.formData.recipientAddress && (
                  <div className="detail-row">
                    <span className="detail-label">Address to Send</span>
                    <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {formatAddress(proposal.formData.recipientAddress)}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ContentCopyIcon 
                          className="copy-icon"
                          style={{ 
                            fontSize: '1rem', 
                            cursor: 'pointer', 
                            color: 'var(--text-secondary)'
                          }}
                          onClick={() => handleCopy(proposal.formData!.recipientAddress!, 'recipient')} 
                        />
                        {copiedAddress === 'recipient' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Copied!</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {proposal.formData.tokenAddress && (
                  <div className="detail-row">
                    <span className="detail-label">Token</span>
                    <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {formatAddress(proposal.formData.tokenAddress)}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ContentCopyIcon 
                          className="copy-icon"
                          style={{ 
                            fontSize: '1rem', 
                            cursor: 'pointer', 
                            color: 'var(--text-secondary)'
                          }}
                          onClick={() => handleCopy(proposal.formData!.tokenAddress!, 'token')} 
                        />
                        {copiedAddress === 'token' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Copied!</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {proposal.formData.poolAddress && (
                  <div className="detail-row">
                    <span className="detail-label">Pool</span>
                    <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {formatAddress(proposal.formData.poolAddress)}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ContentCopyIcon 
                          className="copy-icon"
                          style={{ 
                            fontSize: '1rem', 
                            cursor: 'pointer', 
                            color: 'var(--text-secondary)'
                          }}
                          onClick={() => handleCopy(proposal.formData!.poolAddress!, 'pool')} 
                        />
                        {copiedAddress === 'pool' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>Copied!</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {proposal.formData.duration && (
                  <div className="detail-row">
                    <span className="detail-label">Duration</span>
                    <div className="detail-value">
                      {proposal.formData.duration} days
                    </div>
                  </div>
                )}
                
                {proposal.formData.amount && (
                  <div className="detail-row">
                    <span className="detail-label">Amount</span>
                    <div className="detail-value">
                      {proposal.formData.amount}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="detail-actions" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              {proposal.id === 0 ? (
                <button 
                  className="btn primary"
                  onClick={() => {
                    // Handle transfer action for Donate proposal
                    console.log('Initiating transfer for Donate proposal');
                  }}
                  style={{ width: '100%' }}
                >
                  Transfer
                </button>
              ) : proposal.status === 'pending' && onAccept ? (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <span className="detail-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Proposal Tokens</span>
                    <span style={{ color: 'var(--success)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {proposal.votesFor} available
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '120px', marginLeft: 'auto' }}>
                      <input
                        type="number"
                        placeholder="Amount"
                        min="1"
                        max={proposal.votesFor}
                        value={proposalTokens}
                        onChange={handleTokensChange}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: `1px solid ${inputError ? 'var(--danger)' : 'var(--border)'}`,
                          background: 'var(--bg-secondary)',
                          color: 'var(--text)',
                          fontSize: '0.95rem',
                          width: '100%'
                        }}
                      />
                      {inputError && (
                        <span style={{ color: 'var(--danger)', fontSize: '0.75rem' }}>{inputError}</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
              
              {proposal.status === 'pending' && onAccept ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn primary"
                    onClick={handleAccept}
                    style={{ flex: 1 }}
                    disabled={!proposalTokens || !!inputError}
                  >
                    Accept Proposal
                  </button>
                  <button 
                    className="btn danger"
                    onClick={() => onVote(proposal.id, 'reject')}
                    style={{ flex: 1 }}
                  >
                    Reject Proposal
                  </button>
                </div>
              ) : proposal.status === 'open' && !proposal.hasVoted ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn primary"
                    onClick={() => onVote(proposal.id, 'accept')}
                    style={{ flex: 1 }}
                  >
                    Vote For
                  </button>
                  <button 
                    className="btn danger"
                    onClick={() => onVote(proposal.id, 'reject')}
                    style={{ flex: 1 }}
                  >
                    Vote Against
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Proposals: React.FC = () => {
  const { treasuryId } = useParams<{ treasuryId: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showVotedOnly, setShowVotedOnly] = useState(false);
  
  // Add contractAddress to mock proposals to match the Proposal interface
  const enhancedProposals = useMemo<Proposal[]>(() => 
    mockProposals.map(p => ({
      ...p,
      contractAddress: (p as any).contractAddress || '0x0000000000000000000000000000000000000000',
      voteType: (p as any).voteType || undefined // Ensure voteType is either 'accept', 'reject', or undefined
    })), []);
  
  // Add fixed Donate proposal as the first item
  const donateProposal: Proposal = useMemo(() => ({
    id: 0,
    title: 'Donate to Treasury',
    description: 'Support this treasury by making a donation',
    status: 'open',
    createdDate: new Date().toISOString(),
    closedDate: null,
    votesFor: 0,
    votesAgainst: 0,
    hasVoted: false,
    contractAddress: '0x0000000000000000000000000000000000000000',
    treasuryId: treasuryId ? parseInt(treasuryId, 10) : 0,
    ownerApproved: true
  }), [treasuryId]);

  const [proposals, setProposals] = useState<Proposal[]>([]);
  // Fetch proposals from backend API and merge with mock data
  useEffect(() => {
    if (!treasuryId) return;
    // Map mockProposals to match the local Proposal interface (add contractAddress, voteType, formData)
    const normalizedMockProposals: Proposal[] = mockProposals.map(p => ({
      ...p,
      contractAddress: (p as any).contractAddress || '0x0000000000000000000000000000000000000000',
      voteType: (p as any).voteType || undefined,
      formData: (p as any).formData || undefined
    }));
    fetch(`http://localhost:4000/api/treasuries/${treasuryId}/proposals`)
      .then(res => res.json())
      .then(apiProposals => {
        // Merge backend proposals with normalized mockProposals (avoid duplicates by id)
        const merged = [donateProposal, ...normalizedMockProposals];
        apiProposals.forEach((apiProposal: Proposal) => {
          if (!merged.some(m => m.id === apiProposal.id)) {
            merged.push(apiProposal);
          }
        });
        setProposals(merged);
      })
      .catch(() => setProposals([donateProposal, ...normalizedMockProposals])); // fallback to mock if backend fails
  }, [treasuryId, donateProposal]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isProposalTypeModalOpen, setIsProposalTypeModalOpen] = useState(false);
  
  // Initialize proposals with donateProposal and enhancedProposals
  useEffect(() => {
    setProposals(prev => {
      // Only set initial state if we don't have any proposals yet
      if (prev.length === 0) {
        return [donateProposal, ...enhancedProposals];
      }
      return prev;
    });
  }, [donateProposal, enhancedProposals]);
  
  // Get treasury details with null check
  const treasury = useMemo(() => 
    mockTreasuries.find(r => r.id === parseInt(treasuryId || '0')), 
    [treasuryId]
  );
  
  // Track if treasury is not found
  const isTreasuryNotFound = useMemo(() => 
    treasuryId !== undefined && !treasury,
    [treasuryId, treasury]
  );
  
  useEffect(() => {
    setProposals(prevProposals => {
      const updatedDonateProposal = {
        ...donateProposal,
        treasuryId: treasuryId ? parseInt(treasuryId, 10) : 0
      };
      
      // Keep the donate proposal as the first item
      const otherProposals = prevProposals.filter(p => p.id !== 0);
      return [updatedDonateProposal, ...otherProposals];
    });
  }, [treasuryId]);

  const filteredProposals = useMemo(() => {
    // Always include the Donate proposal at the top if it matches the treasury filter
    const filtered = proposals.filter((proposal: Proposal) => {
      // Skip the Donate proposal in the main filter
      if (proposal.id === 0) return false;
      
      // Filter by search term if provided
      const matchesSearch = searchTerm === '' || 
                       proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       proposal.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status if a filter is set
      const matchesStatus = !statusFilter || 
                          proposal.status.toLowerCase() === statusFilter.toLowerCase();
      
      // Filter by treasury ID if provided
      const currentTreasuryId = treasuryId ? parseInt(treasuryId, 10) : 0;
      const matchesTreasury = !treasuryId || proposal.treasuryId === currentTreasuryId;
      
      // Filter by voted status if showVotedOnly is true
      const matchesVoted = !showVotedOnly || proposal.hasVoted;
      
      return matchesSearch && matchesStatus && matchesTreasury && matchesVoted;
    });
    
    // Add the Donate proposal at the top if it matches the treasury filter
    const currentTreasuryId = treasuryId ? parseInt(treasuryId, 10) : 0;
    const shouldShowDonate = !treasuryId || (donateProposal.treasuryId === currentTreasuryId);
    if (shouldShowDonate && (searchTerm === '' || 
        donateProposal.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        donateProposal.description.toLowerCase().includes(searchTerm.toLowerCase()))) {
      return [donateProposal, ...filtered];
    }
    
    return filtered;
  }, [searchTerm, statusFilter, proposals, treasuryId, donateProposal]);

  const handleVote = useCallback((proposalId: number, vote: 'accept' | 'reject') => {
    // Voting functionality removed as per requirements
    return;
  }, []);

  // Handle accepting a proposal with the specified amount
  const handleAccept = useCallback((proposalId: number, amount: number) => {
    setProposals(prevProposals => 
      prevProposals.map(proposal => 
        proposal.id === proposalId
          ? { 
              ...proposal, 
              votesFor: proposal.votesFor + amount,
              hasVoted: true,
              voteType: 'accept' as const
            }
          : proposal
      )
    );
    closeModal();
  }, []);

  const closeModal = () => {
    setSelectedProposal(null);
  };

  const openProposalTypeModal = useCallback(() => {
    setIsProposalTypeModalOpen(true);
  }, []);

  const closeProposalTypeModal = useCallback(() => {
    setIsProposalTypeModalOpen(false);
  }, []);

  const handleProposalTypeSelect = useCallback((type: string, formData?: ProposalFormData) => {
    if (formData) {
      // Try to post to backend API
      const newProposal: Proposal = {
        id: Date.now(), // Use timestamp as a simple unique ID (will be replaced by backend if successful)
        title: `${type} Proposal`,
        description: formData.description || `New ${type} proposal`,
        status: 'pending',
        createdDate: new Date().toISOString(),
        closedDate: null,
        votesFor: 0,
        votesAgainst: 0,
        hasVoted: false,
        contractAddress: formData.contractAddress || '0x0000000000000000000000000000000000000000',
        treasuryId: treasuryId ? parseInt(treasuryId, 10) : 0,
        ownerApproved: false,
        formData: { ...formData } // Store the form data for display
      };
      if (treasuryId) {
        fetch(`http://localhost:4000/api/treasuries/${treasuryId}/proposals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newProposal.title,
            description: newProposal.description,
            contractAddress: newProposal.contractAddress,
            treasuryId: newProposal.treasuryId,
            // Add any other fields your backend expects
          })
        })
          .then(res => res.json())
          .then(apiProposal => {
            setProposals(prev => [apiProposal, ...prev]);
          })
          .catch(() => {
            // fallback to mock logic if backend fails
            setProposals(prev => [newProposal, ...prev]);
          });
      } else {
        setProposals(prev => [newProposal, ...prev]);
      }
    }
    closeProposalTypeModal();
  }, [treasuryId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const handleInfoClick = (proposal: Proposal) => {
    // Merge form data into the proposal object if it exists
    const proposalWithFormData = {
      ...proposal,
      ...(proposal.formData ? { formData: proposal.formData } : {})
    };
    setSelectedProposal(proposalWithFormData);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      active: 'status-active',
      open: 'status-open',
      pending: 'status-pending',
      closed: 'status-closed',
      executed: 'status-executed',
      rejected: 'status-rejected'
    };
    
    const statusText: { [key: string]: string } = {
      active: 'Active',
      open: 'Open',
      pending: 'Pending',
      closed: 'Closed',
      executed: 'Executed',
      rejected: 'Rejected'
    };
    
    const className = statusClasses[status] || 'status-default';
    const text = statusText[status] || status;
    
    return (
      <span className={`status-badge ${className}`}>
        <span className="status-dot"></span>
        {text}
      </span>
    );
  };

  // Handle case when treasury is not found
  if (isTreasuryNotFound) {
    return <div>Treasury not found</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <button 
            className="btn secondary"
            onClick={() => navigate(-1)}
            style={{ marginBottom: '1rem' }}
          >
            ← Back to {treasury ? treasury.treasuryName : 'Treasuries'}
          </button>
          <h1 style={{ margin: '0.5rem 0' }}>{treasury ? `${treasury.tokenSymbol} Treasury Proposals` : 'All Proposals'}</h1>
          <p className="page-subtitle" style={{ marginBottom: '2rem' }}>View and vote on proposals for this treasury</p>
        </div>
        <div className="header-actions" style={{ 
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          gap: '1rem',
          flexWrap: 'wrap',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid var(--border)'
        }}>
          {/* Transfer Token Button */}
          <button 
            className="btn primary"
            onClick={() => {}}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              marginLeft: '1rem'
            }}
          >
            Transfer Token
          </button>

          {/* Search Bar */}
          <div className="search-container" style={{ 
            maxWidth: '400px',
            margin: '0',
            flex: '1',
            minWidth: '250px',
            marginLeft: 'auto'
          }}>
            <div className="search-bar" style={{ 
              position: 'relative',
              width: '100%',
              margin: '0',
              maxWidth: 'none'
            }}>
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text)',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary)';
                  e.target.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
          
          {/* Filter Buttons and Create Button Row */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            width: '100%',
            maxWidth: '1200px',
            margin: '2rem auto 1.5rem'
          }}>
            {/* Status Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['Open', 'Pending', 'Rejected', 'Closed', 'Executed'].map((status) => (
                <button 
                  key={status}
                  className={`btn small ${statusFilter === status.toLowerCase() ? 'primary' : 'secondary'}`}
                  onClick={() => setStatusFilter(statusFilter === status.toLowerCase() ? null : status.toLowerCase())}
                  style={{
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.8rem',
                    height: '28px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    fontWeight: statusFilter === status.toLowerCase() ? 600 : 'normal'
                  }}
                >
                  {status}
                </button>
              ))}
              <button 
                className={`btn small ${showVotedOnly ? 'primary' : 'secondary'}`}
                onClick={() => {
                  setShowVotedOnly(!showVotedOnly);
                  // Clear status filter when showing voted proposals
                  if (!showVotedOnly) {
                    setStatusFilter(null);
                  }
                }}
                style={{
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.8rem',
                  height: '28px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  fontWeight: showVotedOnly ? 600 : 'normal',
                  backgroundColor: showVotedOnly ? 'var(--primary)' : 'var(--card-bg)',
                  color: showVotedOnly ? 'white' : 'var(--text)',
                  border: `1px solid ${showVotedOnly ? 'var(--primary)' : 'var(--border)'}`
                }}
              >
                My Votes
              </button>
            </div>
            
            {/* Create New Proposal Button */}
            <button 
              className="btn primary"
              onClick={openProposalTypeModal}
              style={{ 
                height: '36px',
                padding: '0 1.5rem',
                marginLeft: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              Create New Proposal
            </button>
          </div>
          <ProposalTypeModal 
            isOpen={isProposalTypeModalOpen}
            onClose={() => setIsProposalTypeModalOpen(false)}
            onSelectType={handleProposalTypeSelect}
            treasuryId={treasuryId}
            setProposals={setProposals}
          />
        </div>
        
        {/* Status Descriptors */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1.5rem',
          marginTop: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-light)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-badge status-open" style={{ margin: 0 }}>Open</span>
            <span>Awaiting to be executed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-badge status-pending" style={{ margin: 0 }}>Pending</span>
            <span>Open to vote</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-badge status-rejected" style={{ margin: 0 }}>Rejected</span>
            <span>Not enough votes</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-badge status-closed" style={{ margin: 0 }}>Closed</span>
            <span>Closed by initiator</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-badge status-executed" style={{ margin: 0 }}>Executed</span>
            <span>Completed</span>
          </div>
        </div>
      </div>

      <div className="treasuries-list" style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '1.5rem' }}>
        {filteredProposals.length > 0 ? (
          <table className="treasuries-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-light)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Title</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Created</th>
                <th style={{ padding: '0.75rem 1rem' }}>Votes</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} style={{ background: 'var(--bg-primary)', borderRadius: '8px' }}>
                  <td style={{ 
                    padding: '1rem', 
                    borderTopLeftRadius: '8px',
                    borderBottomLeftRadius: '8px',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    #{proposal.id}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{proposal.title}</td>
                  <td style={{ padding: '1rem' }}>
                    {getStatusBadge(proposal.status)}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-light)' }}>
                    {formatDate(proposal.createdDate)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {proposal.status === 'rejected' ? (
                      <div style={{ color: 'var(--danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>✗</span> {proposal.votesAgainst} votes
                      </div>
                    ) : proposal.ownerApproved || proposal.status === 'pending' ? (
                      <div style={{ color: 'var(--success)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>✓</span> {proposal.votesFor} votes
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {proposal.votesFor} votes
                      </div>
                    )}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'right',
                    borderTopRightRadius: '8px',
                    borderBottomRightRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        className="btn small primary"
                        onClick={() => handleInfoClick(proposal)}
                        style={{
                          minWidth: '100px',
                          height: '32px',
                          fontSize: '0.9rem',
                          padding: '0.375rem 0.75rem',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = 'var(--shadow)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary)';
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        Info
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-results" style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-light)'
          }}>
            No proposals found matching your search
          </div>
        )}
      </div>
      
      {selectedProposal && (
        <ProposalModal 
          proposal={selectedProposal}
          onClose={closeModal}
          onVote={handleVote}
          onAccept={handleAccept}
        />
      )}
    </div>
  );
};

// Export the component as default
export default Proposals;
