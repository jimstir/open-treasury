import React, { useState } from 'react';
import { ethers } from 'ethers';
import TreasuryVaultABI from '../abis/TreasuryVault.json';
import LendingABI from '../abis/Lending.json';
import { useDataMode } from '../contexts/DataModeContext';

interface CreateProposalModalProps {
  isOpen: boolean;
  treasuryAddress: string;
  treasuryName: string;
  lendingContractAddress?: string;
  onClose: () => void;
  onCreateProposal: (proposalData: {
    type: string;
    description: string;
    amount?: string;
    receiver?: string;
    tokenAddress?: string;
    poolAddress?: string;
    votingType: 'ratio' | 'totalSupply';
    time?: string;
    per?: string;
    price?: string;
  }) => Promise<void>;
}

interface ProposalFormData {
  description: string;
  amount: string;
  receiver: string;
  tokenAddress: string;
  poolAddress: string;
  votingType: 'ratio' | 'totalSupply';
  time?: string;
  per?: string;
  price?: string;
}

const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  treasuryAddress,
  treasuryName,
  lendingContractAddress,
  onClose,
  onCreateProposal
}) => {
  const { useLiveData } = useDataMode();
  const [currentStep, setCurrentStep] = useState<'selectType' | 'form'>('selectType');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProposalFormData>({
    description: '',
    amount: '',
    receiver: '',
    tokenAddress: '',
    poolAddress: '',
    votingType: 'ratio',
    time: '',
    per: '',
    price: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Policy types
  const proposalTypes = [
    { display: 'Join a Pool', value: 'Liquidity Pool', description: 'Join a liquidity pool to earn rewards.' },
    { display: 'Collateral Based', value: 'Collateral Based Lending', description: 'Use treasury assets to lend to shareholders with collateral.' },
    { display: 'Acquire Asset', value: 'Acquire Asset', description: 'Purchase new assets for the treasury.' },
    { display: 'Treasury Buy Back', value: 'Treasury Buy Back', description: 'Buy back the treasury tokens.' },
    { display: 'Token Sale', value: 'Token Sale', description: 'Request the treasury do token sale to raise funds.(Treasury must own treasuryTokens)' }
  ];

  const resetModal = () => {
    setCurrentStep('selectType');
    setSelectedType(null);
    setFormData({
      description: '',
      amount: '',
      receiver: '',
      tokenAddress: '',
      poolAddress: '',
      votingType: 'ratio',
      time: '',
      per: '',
      price: ''
    });
    setNotification({ type: null, message: '' });
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setCurrentStep('form');
  };

  const handleBackToTypeSelection = () => {
    setCurrentStep('selectType');
    setSelectedType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification({ type: null, message: '' }); // Clear previous notifications

    try {
      // @ts-ignore - ethereum is injected by the wallet
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      let tx;
      
      if (selectedType === 'Collateral Based Lending') {
        // Call Lending contract's createProposal function
        if (!lendingContractAddress) {
          throw new Error('Lending contract address not provided');
        }
        const lendingContract = new ethers.Contract(lendingContractAddress, LendingABI, signer);
        
        // Convert amount to wei (assuming 18 decimals)
        const amountInWei = formData.amount ? ethers.utils.parseEther(formData.amount) : ethers.constants.Zero;
        
        // Call createProposal(uint256 amount, IERC20 token, bool rate, uint256 time)
        tx = await lendingContract.createProposal(
          amountInWei,
          formData.tokenAddress || ethers.constants.AddressZero,
          formData.votingType === 'ratio', // rate parameter
          formData.time ? ethers.BigNumber.from(formData.time) : ethers.constants.Zero
        );
      } else {
        // Call TreasuryVault proposalOpen for other proposal types
        const vaultContract = new ethers.Contract(treasuryAddress, TreasuryVaultABI.abi, signer);

        // Convert amount to wei (assuming 18 decimals)
        const amountInWei = formData.amount ? ethers.utils.parseEther(formData.amount) : ethers.constants.Zero;

        // Call proposalOpen function
        // proposalOpen(uint256 amount, address receiver, address owner, bool rate, bool request, address token)
        tx = await vaultContract.proposalOpen(
          amountInWei,
          formData.receiver || ethers.constants.AddressZero,
          await signer.getAddress(), // owner is the current user
          formData.votingType === 'ratio', // rate parameter (true for ratio, false for total supply 75%)
          true, // request parameter (always true for voting requirement)
          formData.tokenAddress || ethers.constants.AddressZero
        );
      }

      await tx.wait();

      // Success notification
      setNotification({
        type: 'success',
        message: `✅ Proposal created successfully! Transaction hash: ${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}`
      });

      onCreateProposal({
        type: selectedType!,
        description: formData.description,
        amount: formData.amount,
        receiver: formData.receiver,
        tokenAddress: formData.tokenAddress,
        poolAddress: formData.poolAddress,
        votingType: formData.votingType,
        time: formData.time,
        per: formData.per,
        price: formData.price
      });
    } catch (error: any) {
      console.error('Failed to create proposal:', error);

      // Error notification
      let errorMessage = '❌ Failed to create proposal.';
      if (error.code === 4001) {
        errorMessage += ' User rejected the transaction.';
      } else if (error.message) {
        errorMessage += ` ${error.message}`;
      }

      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Clear any existing notifications when user starts typing
    if (notification.type) {
      setNotification({ type: null, message: '' });
    }

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

  const handleVotingTypeChange = (votingType: 'ratio' | 'totalSupply') => {
    setFormData(prev => ({
      ...prev,
      votingType
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: currentStep === 'selectType' ? '600px' : '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            {currentStep === 'selectType' ? 'Create Proposal' : `Create ${selectedType === 'Liquidity Pool' ? 'Join a Pool' : selectedType} Proposal`}
          </h2>
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {currentStep === 'selectType' ? (
          // Proposal Type Selection
          <div>
            <p style={{ marginBottom: '20px', color: '#666' }}>Select policy type:</p>
            <div style={{ display: 'grid', gap: '12px' }}>
              {proposalTypes.map((type) => {
                const isJoinPoolDisabled = type.value === 'Liquidity Pool' && useLiveData;
                return (
                  <button
                    key={type.value}
                    onClick={() => !isJoinPoolDisabled && handleTypeSelect(type.value)}
                    disabled={isJoinPoolDisabled}
                    style={{
                      padding: '16px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '8px',
                      background: isJoinPoolDisabled ? '#f5f5f5' : 'white',
                      cursor: isJoinPoolDisabled ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      opacity: isJoinPoolDisabled ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isJoinPoolDisabled) {
                        e.currentTarget.style.borderColor = '#007bff';
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isJoinPoolDisabled) {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {type.display}
                      {isJoinPoolDisabled && (
                        <span style={{ fontSize: '12px', color: '#dc3545', marginLeft: '8px' }}>
                          (Disabled in Live Mode)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>{type.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // Proposal Form
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Description:
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Describe your proposal..."
              />
            </div>

            {/* Dynamic fields based on proposal type */}
            {selectedType === 'Liquidity Pool' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Pool Address:
                  </label>
                  <input
                    type="text"
                    name="poolAddress"
                    value={formData.poolAddress}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="0x..."
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Token Address:
                  </label>
                  <input
                    type="text"
                    name="tokenAddress"
                    value={formData.tokenAddress}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="0x..."
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Time (Unix Timestamp):
                  </label>
                  <input
                    type="number"
                    name="time"
                    value={formData.time || ''}
                    onChange={handleInputChange}
                    required
                    min={Math.floor(Date.now() / 1000)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="When the pool join expires"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Amount to Deposit:
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.000001"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="Enter amount"
                  />
                </div>
              </>
            )}

            {selectedType === 'Collateral Based Lending' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Token Address:
                  </label>
                  <input
                    type="text"
                    name="tokenAddress"
                    value={formData.tokenAddress}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="0x..."
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Loan Amount:
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.000001"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="Enter loan amount"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Minimum Loan Duration (Unix Timestamp):
                  </label>
                  <input
                    type="number"
                    name="time"
                    value={formData.time || ''}
                    onChange={handleInputChange}
                    required
                    min={Math.floor(Date.now() / 1000)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="When the loan period ends"
                  />
                </div>
              </>
            )}

            {selectedType === 'Acquire Asset' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Asset Address:
                  </label>
                  <input
                    type="text"
                    name="tokenAddress"
                    value={formData.tokenAddress}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="0x..."
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Amount to Purchase:
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.000001"
                    min="0"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="Enter amount"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Recipient Address:
                  </label>
                  <input
                    type="text"
                    name="receiver"
                    value={formData.receiver}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="0x..."
                  />
                </div>
              </>
            )}

            {selectedType === 'Treasury Buy Back' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Token to Buy Back:
                  </label>
                  <input
                    type="text"
                    name="tokenAddress"
                    value={formData.tokenAddress}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="0x..."
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    End Time (Unix Timestamp):
                  </label>
                  <input
                    type="number"
                    name="time"
                    value={formData.time || ''}
                    onChange={handleInputChange}
                    required
                    min={Math.floor(Date.now() / 1000)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="When the buyback period ends"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Max Amount Per User:
                  </label>
                  <input
                    type="number"
                    name="per"
                    value={formData.per || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.000001"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="Maximum tokens per user"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Buyback Price:
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.000001"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="Price for buyback tokens"
                  />
                </div>
              </>
            )}

            {selectedType === 'Token Sale' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Token Address:
                  </label>
                  <input
                    type="text"
                    name="tokenAddress"
                    value={formData.tokenAddress}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="0x..."
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Max Amount (Cap):
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.000001"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="Maximum total tokens to sell"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                    Exchange Ratio:
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.000001"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                    placeholder="Tokens per payment unit (e.g., 100)"
                  />
                </div>
              </>
            )}

            {/* Voting Type */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Voting Type:
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="votingType"
                    checked={formData.votingType === 'ratio'}
                    onChange={() => handleVotingTypeChange('ratio')}
                    style={{ marginRight: '8px' }}
                  />
                  <span>Ratio</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="votingType"
                    checked={formData.votingType === 'totalSupply'}
                    onChange={() => handleVotingTypeChange('totalSupply')}
                    style={{ marginRight: '8px' }}
                  />
                  <span>Total Supply (75%)</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleBackToTypeSelection}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ccc',
                  background: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: isSubmitting ? '#ccc' : '#007bff',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Creating...' : 'Open Proposal'}
              </button>
            </div>
          </form>
        )}

        {/* Notification */}
        {notification.type && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            borderRadius: '4px',
            backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da',
            color: notification.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProposalModal;
