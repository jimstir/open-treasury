import React from 'react';

const About = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">About Open Treasury</h1>
      <p className="page-text">
        Open Treasury is a decentralized protocol for managing on-chain treasuries.
        Our platform enables secure, transparent, and efficient management of
        digital assets with full on-chain governance and transparency.
      </p>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works" style={{ padding: '4rem 1rem', backgroundColor: '#f8f9fa' }}>
        <div className="section-header" style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>How It Works</h2>
          <p style={{ fontSize: '1.25rem', color: '#666' }}>Manage your on-chain treasury with confidence</p>
        </div>
        <div className="steps" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="step" style={{ flex: '1', minWidth: '250px', maxWidth: '300px', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="step-number" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4a6cf7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 'bold' }}>1</div>
            <h3 style={{ marginBottom: '1rem' }}>Connect Your Wallet</h3>
            <p style={{ color: '#666' }}>Securely connect your Web3 wallet to access the Open Treasury platform.</p>
          </div>
          <div className="step" style={{ flex: '1', minWidth: '250px', maxWidth: '300px', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="step-number" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4a6cf7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 'bold' }}>2</div>
            <h3 style={{ marginBottom: '1rem' }}>Manage Assets</h3>
            <p style={{ color: '#666' }}>Deposit and monitor the treasury assets with full transparency.</p>
          </div>
          <div className="step" style={{ flex: '1', minWidth: '250px', maxWidth: '300px', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div className="step-number" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4a6cf7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontWeight: 'bold' }}>3</div>
            <h3 style={{ marginBottom: '1rem' }}>Govern & Control</h3>
            <p style={{ color: '#666' }}>Participate in governance to help control the treasury operations.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
