import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import WalletModal from './WalletModal';
import '../App.css';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [currentNetwork, setCurrentNetwork] = useState('Ethereum');
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const account = accounts[0];
          setWalletAddress(account);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking connected accounts:', error);
      }
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        } else {
          setWalletAddress('');
          setIsConnected(false);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      window.open('https://metamask.io/download.html', '_blank');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        const account = accounts[0];
        setWalletAddress(account);
        setIsConnected(true);
        setIsModalOpen(false);
        // Redirect to dashboard after successful connection
        if (location.pathname === '/') {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const handleConnectClick = () => {
    if (isConnected) {
      setShowWalletDropdown(!showWalletDropdown);
    } else {
      setIsModalOpen(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowWalletDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSwitchWallet = () => {
    setShowWalletDropdown(false);
    setIsModalOpen(true);
  };

  const handleDisconnect = () => {
    setWalletAddress('');
    setIsConnected(false);
    setShowWalletDropdown(false);
  };

  const switchNetwork = async (network: string) => {
    // In a real app, you would handle network switching here
    setCurrentNetwork(network);
    setShowWalletDropdown(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="nav-left">
            <button 
              className="menu-toggle" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <span className="material-icons-round">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
            <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
              <img src="/logo.svg" alt="Open Treasury" className="logo" />
            </Link>
          </div>
          
          <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Home
            </Link>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
            <Link to="/about" className={`nav-link ${isActive('/about')}`}>
              About
            </Link>
          </div>
          
          <div className="nav-actions" ref={dropdownRef}>
            <button 
              className={`wallet-button ${isConnected ? 'connected' : ''}`}
              onClick={handleConnectClick}
              aria-label={isConnected ? 'Connected wallet' : 'Connect wallet'}
              aria-expanded={showWalletDropdown}
            >
              {isConnected ? (
                <span className="wallet-address">
                  {formatAddress(walletAddress)}
                  <span className="network-badge">{currentNetwork}</span>
                </span>
              ) : (
                <>
                  <span className="material-icons-round" style={{ marginRight: '6px', fontSize: '1.25rem' }}>account_balance_wallet</span>
                  Connect Wallet
                </>
              )}
              {isConnected && (
                <span className={`material-icons-round dropdown-arrow ${showWalletDropdown ? 'rotate' : ''}`}>
                  expand_more
                </span>
              )}
            </button>
            
            {showWalletDropdown && isConnected && (
              <div className="wallet-dropdown">
                <div className="wallet-info">
                  <div className="wallet-address-full">{walletAddress}</div>
                  <div className="wallet-network">
                    <span className="network-dot"></span>
                    {currentNetwork}
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <div className="network-options">
                  <div className="dropdown-label">Switch Network</div>
                  <button 
                    className={`network-option ${currentNetwork === 'Ethereum' ? 'active' : ''}`}
                    onClick={() => switchNetwork('Ethereum')}
                  >
                    <span className="network-icon eth"></span>
                    Ethereum Mainnet
                  </button>
                  <button 
                    className={`network-option ${currentNetwork === 'Polygon' ? 'active' : ''}`}
                    onClick={() => switchNetwork('Polygon')}
                  >
                    <span className="network-icon polygon"></span>
                    Polygon
                  </button>
                  <button 
                    className={`network-option ${currentNetwork === 'Arbitrum' ? 'active' : ''}`}
                    onClick={() => switchNetwork('Arbitrum')}
                  >
                    <span className="network-icon arbitrum"></span>
                    Arbitrum One
                  </button>
                </div>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item" onClick={handleSwitchWallet}>
                  <span className="material-icons-round">swap_horiz</span>
                  Switch Wallet
                </button>
                <button className="dropdown-item" onClick={handleDisconnect}>
                  <span className="material-icons-round">logout</span>
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {mobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onConnect={connectWallet}
      />
      

    </>
  );
};

export default TopBar;
