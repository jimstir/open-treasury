import React from 'react';

type WalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
};

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  if (!isOpen) return null;

  const handleConnect = async () => {
    try {
      await onConnect();
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Connect Wallet</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p>Connect your wallet to continue</p>
          <button className="connect-button" onClick={handleConnect}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
              alt="MetaMask" 
              className="wallet-icon"
            />
            MetaMask
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
