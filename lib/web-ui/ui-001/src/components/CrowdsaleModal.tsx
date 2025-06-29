import React, { useState } from 'react';

interface CrowdsaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (ratio: number) => Promise<void>;
  treasuryTokenAddress: string;
  reserveVaultAddress: string;
  treasuryTokenSymbol?: string;
  reserveVaultSymbol?: string;
}

const CrowdsaleModal: React.FC<CrowdsaleModalProps> = ({
  isOpen,
  onClose,
  onLaunch,
  treasuryTokenAddress,
  reserveVaultAddress,
  treasuryTokenSymbol = 'TKN',
  reserveVaultSymbol = 'RDN'
}) => {
  const [ratio, setRatio] = useState<string>('');
  const [isLaunching, setIsLaunching] = useState(false);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [crowdsaleAddress, setCrowdsaleAddress] = useState<string>('');

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [field]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [field]: false })), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ratioNum = parseFloat(ratio);
    if (isNaN(ratioNum) || ratioNum <= 0) return;
    try {
      setIsLaunching(true);
      setDeploymentStatus('deploying');
      // Use deployCrowdsale directly here (if not handled by parent)
      if (typeof window !== 'undefined' && window.ethereum) {
        const { deployCrowdsale } = await import('../blockchain/crowdsaleService');
        const provider = new (window as any).ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        await deployCrowdsale(
          signer,
          treasuryTokenAddress,
          reserveVaultAddress,
          ratioNum
        );
        setDeploymentStatus('success');
      } else {
        await onLaunch(ratioNum);
        setDeploymentStatus('success');
      }
    } catch (error) {
      console.error('Error launching crowdsale:', error);
      setDeploymentStatus('error');
    } finally {
      setIsLaunching(false);
    }
  };

  if (!isOpen) return null;

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Deployment Successful! 🎉</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="success-message">
            <p>Your contracts have been deployed successfully!</p>
            
            <div className="contract-address">
              <span className="label">TreasuryToken <span style={{ color: '#4f46e5', fontWeight: 600, marginLeft: 4 }}>({treasuryTokenSymbol})</span>:</span>
              <div className="address-row">
                <span className="address">{formatAddress(treasuryTokenAddress)}</span>
                <button 
                  className="copy-button"
                  onClick={() => handleCopy(treasuryTokenAddress, 'token')}
                  title="Copy to clipboard"
                >
                  📋 {copied['token'] ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            
            <div className="contract-address">
              <span className="label">ReserveVault <span style={{ color: '#16a34a', fontWeight: 600, marginLeft: 4 }}>({reserveVaultSymbol})</span>:</span>
              <div className="address-row">
                <span className="address">{formatAddress(reserveVaultAddress)}</span>
                <button 
                  className="copy-button"
                  onClick={() => handleCopy(reserveVaultAddress, 'vault')}
                  title="Copy to clipboard"
                >
                  📋 {copied['vault'] ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="crowdsale-section">
              <h3>Launch Crowdsale</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="ratio">Please enter the initial ratio for the treasury token. ( 1 USDC = {ratio || 'X'} Tokens )</label>
                  <input
                    type="number"
                    id="ratio"
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value)}
                    placeholder="Enter token ratio"
                    step="0.000000000000000001"
                    min="0.000000000000000001"
                    required
                  />
                </div>
                {deploymentStatus === 'deploying' && (
                  <div className="deployment-status">
                    <div className="spinner"></div>
                    <span>Deploying Crowdsale contract...</span>
                  </div>
                )}
                {deploymentStatus === 'success' && (
                  <div className="deployment-success">
                    <span>✓ Crowdsale deployed successfully!</span>
                    <button 
                      type="button" 
                      className="close-button"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>
                )}
                {deploymentStatus === 'error' && (
                  <div className="deployment-error">
                    <span>Error deploying crowdsale. Please try again.</span>
                    <button 
                      type="button" 
                      className="retry-button"
                      onClick={() => setDeploymentStatus('idle')}
                    >
                      Try Again
                    </button>
                  </div>
                )}
                {deploymentStatus === 'idle' && (
                  <button 
                    type="submit" 
                    className="launch-button"
                    disabled={isLaunching}
                  >
                    {isLaunching ? 'Launching...' : 'Launch Crowdsale'}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          border-radius: 8px;
          padding: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        
        .success-message {
          text-align: center;
        }
        
        .contract-address {
          margin: 20px 0;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 6px;
        }
        
        .label {
          display: block;
          font-weight: 500;
          margin-bottom: 6px;
        }
        
        .address-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .address {
          font-family: monospace;
          font-size: 14px;
          color: #333;
        }
        
        .copy-button {
          background: #e9ecef;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .copy-button:hover {
          background: #dee2e6;
        }
        
        .crowdsale-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #eee;
        }
        
        .form-group {
          margin-bottom: 16px;
          text-align: left;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
        }
        
        .form-group input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .launch-button {
          width: 100%;
          padding: 12px;
          background: #4f46e5;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .launch-button:hover {
          background: #4338ca;
        }
        
        .launch-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .deployment-status, 
        .deployment-success, 
        .deployment-error {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 4px;
          margin-top: 15px;
        }
        
        .deployment-status {
          background-color: #e6f7ff;
          color: #1890ff;
        }
        
        .deployment-success {
          background-color: #f6ffed;
          color: #52c41a;
          justify-content: space-between;
        }
        
        .deployment-error {
          background-color: #fff2f0;
          color: #ff4d4f;
          justify-content: space-between;
        }
        
        .spinner {
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 2px solid #1890ff;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .retry-button {
          background: #ff4d4f;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 5px 10px;
          cursor: pointer;
          margin-left: 10px;
        }
        
        .retry-button:hover {
          background: #ff7875;
        }
      `}</style>
    </div>
  );
};

export default CrowdsaleModal;
