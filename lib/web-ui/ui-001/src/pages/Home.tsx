import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="landing-page" style={{
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      /* Background image placeholder - Replace with actual image */
      /* Recommended image specs:
         - Format: WebP (with JPEG fallback for older browsers)
         - Size: 1920x1080px (16:9 aspect ratio)
         - Resolution: 72-96 DPI (standard web resolution)
         - File size: Optimized to be under 300KB
         - Color space: sRGB
         - Add a subtle overlay if text needs better contrast */
      /* background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
                  url('/path/to/your/hero-image.webp') center/cover no-repeat; */
      /* For responsive images, consider using the picture element:
         <picture>
           <source srcSet="/path/to/hero-image-large.webp" media="(min-width: 1200px)" />
           <source srcSet="/path/to/hero-image-medium.webp" media="(min-width: 768px)" />
           <source srcSet="/path/to/hero-image-small.webp" />
           <img src="/path/to/hero-image-fallback.jpg" alt="" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} />
         </picture>
      */
    }}>
      {/* Hero Section */}
      <section className="hero" style={{
        padding: '4rem 1rem',
        margin: '0 auto',
        width: '100%',
        maxWidth: '1200px',
        position: 'relative',
        zIndex: 1,
        /* Semi-transparent background for better text readability */
        /* Can be adjusted based on the actual image */
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1.5rem' }}>The Future Treasury  </h1>
          <p className="hero-subtitle" style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
            Create a transparent treasury on-chain. 
            Proof-of-Treasurys, Proof-of-Revenue, Proof-of-Transactions and more with OpenTreasury.
          </p>
          <div className="hero-buttons" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/dashboard" className="btn primary" style={{ padding: '0.75rem 2rem' }}>Launch App</Link>
            <a href="#how-it-works" className="btn secondary" style={{ padding: '0.75rem 2rem' }}>Learn More</a>
          </div>
          
          
          <div className="hero-stats" style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem' }}>
            <div> 
              <p className="hero-subtitle" style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>
              Made with <span style={{ color: '#e25555' }}>❤️</span> by <span style={{ color: '#666' }}>@jimstir</span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
