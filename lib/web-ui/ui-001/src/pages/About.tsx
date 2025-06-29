import React, { useState } from 'react';
import CrowdsaleModal from '../components/CrowdsaleModal';

const About = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Placeholder values, replace with real data as needed
  const treasuryTokenAddress = "0x0000000000000000000000000000000000000000";
  const treasuryVaultAddress = "0x0000000000000000000000000000000000000000";

  const handleLaunch = async (ratio: number) => {
    // Implement launch logic here
    alert(`Crowdsale launched with ratio: ${ratio}`);
  }
  return (
    <div className="page-container">
      <h1 className="page-title">About Lentoz</h1>
      <p className="page-text">
        Lentoz is a decentralized lending platform that connects borrowers and lenders
        in a secure and transparent way. Our mission is to make decentralized finance
        accessible to everyone.
      </p>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works" style={{ padding: '4rem 1rem', backgroundColor: '#f8f9fa' }}>
        <div className="section-header" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>How It Works</h2>
          <p style={{ fontSize: '1.25rem', color: '#666' }}>Start earning or borrowing in just a few simple steps</p>
        </div>
        <div className="steps" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="step" style={{ flex: '1', minWidth: '250px', maxWidth: '300px', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="step-number" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4a6cf7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 'bold' }}>1</div>
            <h3 style={{ marginBottom: '1rem' }}>Connect Your Wallet</h3>
            <p style={{ color: '#666' }}>Connect your preferred Web3 wallet like MetaMask to get started with Lentoz.</p>
          </div>
          <div className="step" style={{ flex: '1', minWidth: '250px', maxWidth: '300px', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="step-number" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4a6cf7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 'bold' }}>2</div>
            <h3 style={{ marginBottom: '1rem' }}>Deposit or Borrow</h3>
            <p style={{ color: '#666' }}>Supply assets to earn interest or take out a loan against your crypto collateral.</p>
          </div>
          <div className="step" style={{ flex: '1', minWidth: '250px', maxWidth: '300px', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="step-number" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4a6cf7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 'bold' }}>3</div>
            <h3 style={{ marginBottom: '1rem' }}>Earn or Access Liquidity</h3>
            <p style={{ color: '#666' }}>Start earning passive income or access the liquidity you need instantly.</p>
          </div>
        </div>
      </section>
      {/* Crowdsale Modal Button */}
      <div style={{ margin: '2rem 0', textAlign: 'center' }}>
        <button className="btn primary" onClick={() => setIsModalOpen(true)}>
          Open Crowdsale
        </button>
      </div>

      {/* Crowdsale Modal */}
      <CrowdsaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLaunch={handleLaunch}
        treasuryTokenAddress={treasuryTokenAddress}
        reserveVaultAddress={treasuryVaultAddress}
      />
    </div>
  );
};

export default About;
