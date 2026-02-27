import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <Link to="/" className="footer-home-link">
            Home
          </Link>
        </div>
        <div className="footer-center">
          <span className="footer-title">Open Treasury</span>
        </div>
        <div className="footer-right">
          {/* Space for future right-side content */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
