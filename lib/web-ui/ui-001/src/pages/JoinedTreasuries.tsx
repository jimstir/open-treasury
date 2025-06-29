import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Web3Provider } from '@ethersproject/providers';
// Import removed as getTreasuryName is not used

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Mock data for treasuries
const mockTreasuries = [
  {
    id: 1,
    address: '0x123...', // Replace with actual token addresses
    amount: '100.50',
    symbol: 'AAVE',
    status: 'Active',
    date: '2023-06-09',
    apr: '3.25%'
  },
  // Add more mock treasuries as needed
];

const JoinedTreasuries = () => {
  const navigate = useNavigate();
  const [treasuries, setTreasuries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch the user's treasuries from a smart contract or API
    // For now, we'll use the mock data
    setTreasuries(mockTreasuries.map(treasury => ({
      ...treasury,
      name: treasury.symbol // Use symbol as name for now
    })));
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading treasuries...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <button 
            onClick={() => navigate(-1)} 
            className="back-button"
            aria-label="Go back"
          >
            <span className="material-icons">arrow_back</span>
          </button>
          <h1>My Joined Treasurys</h1>
        </div>
      </div>
      
      <div className="treasuries-container">
        <div className="treasuries-widget">
          <div className="treasuries-header">
            <h2>Your Treasuries</h2>
            <div className="treasuries-count">{treasuries.length} {treasuries.length === 1 ? 'treasury' : 'treasuries'}</div>
          </div>
          
          <div className="treasuries-list">
            {treasuries.length === 0 ? (
              <div className="no-treasuries">No treasury tokens found</div>
            ) : (
              treasuries.map((treasury) => (
              <div key={treasury.id} className="treasury-item">
                <div className="treasury-icon">
                  <span className="material-icons">{treasury.name ? treasury.name.charAt(0).toUpperCase() : 'account_balance_wallet'}</span>
                </div>
                <div className="treasury-details">
                  <div className="treasury-name">
                    {treasury.name || `Treasury ${treasury.id}`}
                    <span className={`status-badge ${treasury.status.toLowerCase()}`}>
                      {treasury.status}
                    </span>
                  </div>
                  <div className="treasury-meta">
                    <span>Amount: {treasury.amount} {treasury.symbol}</span>
                    <span>APR: {treasury.apr}</span>
                    <span>Joined: {treasury.date}</span>
                    <span className="treasury-address" title={treasury.address}>
                      {treasury.address.substring(0, 6)}...{treasury.address.substring(treasury.address.length - 4)}
                    </span>
                  </div>
                </div>
                <div className="treasury-actions">
                  <button className="btn small">View</button>
                </div>
              </div>
            )))}
          </div>
          
          <div className="treasuries-footer">
            <button className="btn secondary">View All Transactions</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinedTreasuries;
