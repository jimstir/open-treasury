import React, { useState } from 'react';

interface CreateTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (deploymentData: {
    // TreasuryToken settings
    name: string;
    symbol: string;
    // TreasuryVault settings
    resName: string;
    tokenName: string;
    tokenSymbol: string;
  }) => Promise<{
    treasuryTokenAddress: string;
    reserveVaultAddress: string;
  }>;
}

const CreateTreasuryModal: React.FC<CreateTreasuryModalProps> = ({ isOpen, onClose, onDeploy }) => {
  const [formData, setFormData] = useState({
    // TreasuryToken fields
    name: '',
    symbol: '',
    // TreasuryVault fields
    resName: '',
    // Additional settings
    tToken: '',  // Will be set after token deployment
    tokenName: '', // For TreasuryVault ERC20
    tokenSymbol: '' // For TreasuryVault ERC20
  });
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState<'idle' | 'deployingToken' | 'deployingVault' | 'completed' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Treasury Token validations
    if (!formData.name.trim()) {
      newErrors.name = 'Token name is required';
    }
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Token symbol is required';
    } else if (formData.symbol.length < 2 || formData.symbol.length > 5) {
      newErrors.symbol = 'Symbol must be 2-5 characters';
    }
    
    // Treasury Treasury validations
    if (!formData.resName.trim()) {
      newErrors.resName = 'Treasury name is required';
    }
    
    if (!formData.tokenName.trim()) {
      newErrors.tokenName = 'Treasury token name is required';
    }
    
    if (!formData.tokenSymbol.trim()) {
      newErrors.tokenSymbol = 'Treasury token symbol is required';
    } else if (formData.tokenSymbol.length < 2 || formData.tokenSymbol.length > 5) {
      newErrors.tokenSymbol = 'Treasury token symbol must be 2-5 characters';
    }
    

    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAddressClick = (field: string) => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setFormData(prev => ({
        ...prev,
        [field]: window.ethereum.selectedAddress
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setIsDeploying(true);
      setDeploymentStep('deployingToken');
      
      // This will trigger the deployment sequence in the parent component
      const result = await onDeploy(formData);
      
      // The parent component should handle the deployment and return the addresses
      console.log('Deployment successful:', result);
      setDeploymentStep('completed');
      onClose();
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentStep('error');
      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Deployment failed: ${errorMessage}`);
    } finally {
      setIsDeploying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--card-bg)',
          padding: '2rem',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Create New Treasury</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text)',
            }}
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Treasury Token Settings</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="name" 
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  color: 'var(--text)'
                }}
              >
                Token Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${errors.name ? 'var(--error)' : 'var(--border)'}`,
                  fontSize: '1rem',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text)'
                }}
                placeholder="Enter token name"
                disabled={isDeploying}
              />
              {errors.name && (
                <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.name}
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="symbol" 
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  color: 'var(--text)'
                }}
              >
                Token Symbol
              </label>
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${errors.symbol ? 'var(--error)' : 'var(--border)'}`,
                  fontSize: '1rem',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text)'
                }}
                placeholder="Enter token symbol (2-5 chars)"
                disabled={isDeploying}
              />
              {errors.symbol && (
                <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.symbol}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Treasury Treasury Settings</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="resName" 
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  color: 'var(--text)'
                }}
              >
                Treasury Name
              </label>
              <input
                type="text"
                id="resName"
                name="resName"
                value={formData.resName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${errors.resName ? 'var(--error)' : 'var(--border)'}`,
                  fontSize: '1rem',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text)'
                }}
                placeholder="Enter treasury name"
                disabled={isDeploying}
              />
              {errors.resName && (
                <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.resName}
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="tokenName" 
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  color: 'var(--text)'
                }}
              >
                Governance Token Name
              </label>
              <input
                type="text"
                id="tokenName"
                name="tokenName"
                value={formData.tokenName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${errors.tokenName ? 'var(--error)' : 'var(--border)'}`,
                  fontSize: '1rem',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text)'
                }}
                placeholder="Enter treasury token name"
                disabled={isDeploying}
              />
              {errors.tokenName && (
                <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.tokenName}
                </div>
              )}
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label 
                htmlFor="tokenSymbol" 
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  color: 'var(--text)'
                }}
              >
                Governance Token Symbol
              </label>
              <input
                type="text"
                id="tokenSymbol"
                name="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${errors.tokenSymbol ? 'var(--error)' : 'var(--border)'}`,
                  fontSize: '1rem',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--text)'
                }}
                placeholder="Enter treasury token symbol"
                disabled={isDeploying}
              />
              {errors.tokenSymbol && (
                <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  {errors.tokenSymbol}
                </div>
              )}
            </div>


          </div>
          
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--card-bg-secondary)', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: 'var(--primary)' }}>
              Additional Settings (Optional)
            </h3>
            
            {deploymentStep !== 'idle' && (
              <div style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                backgroundColor: 'var(--card-bg)', 
                borderRadius: '8px',
                borderLeft: `4px solid ${
                  deploymentStep === 'completed' ? 'var(--success)' : 
                  deploymentStep === 'error' ? 'var(--error)' : 'var(--primary)'
                }`
              }}>
                {deploymentStep === 'deployingToken' && 'Deploying Treasury Token...'}
                {deploymentStep === 'deployingVault' && 'Deploying Treasury Vault...'}
                {deploymentStep === 'completed' && 'Deployment completed successfully!'}
                {deploymentStep === 'error' && 'Deployment failed. Please try again.'}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'none',
                color: 'var(--text)',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: isDeploying ? 'var(--disabled)' : 'var(--primary)',
                color: 'white',
                cursor: isDeploying ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 500,
                opacity: isDeploying ? 0.7 : 1
              }}
            >
              Create Treasury
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTreasuryModal;
