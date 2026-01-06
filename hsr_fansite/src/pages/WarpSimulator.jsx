// src/pages/WarpSimulator.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PillNav from '../components/PillNav';
import GradientText from '../components/GradientText';
import HSRLogoKafka from '../assets/HSR_Logo_Kafka.png';
import HSRLogoPompom from '../assets/HSR_Logo_Pompom.png';
import StellarJadePNG from '../assets/Item_Stellar_Jade.png';
import '../css/WarpSimulator.css';

const WarpSimulator = () => {
  const containerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="warp-simulator-page">
      <PillNav
        logo={HSRLogoPompom}
        logoAlt="Honkai: Star Rail Logo"
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Character List', href: '/character-list' },
          { label: 'Edit Characters', href: '/edit-characters' },
          { label: 'Warp Simulator', href: '/warp-simulator' },
          { label: 'Credits', href: '/credits' }
        ]}
        activeHref="/warp-simulator"
        baseColor="#753eceff"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
      />

      <div className="warp-container">
        <div className="warp-header">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={3}
            showBorder={false}
            className="Page-Title"
          >
            HSR Warp Simulator
          </GradientText>
          <p className="warp-subtitle">Experience the gacha system of Honkai: Star Rail</p>
        </div>

        <div className="warp-content">
          <div className="warp-frame-container" ref={containerRef}>
            <div className="warp-controls">
              <span className="warp-controls-title">Warp Simulator</span>
              <button
                className="fullscreen-toggle"
                onClick={toggleFullScreen}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                    <span>Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                    <span>Fullscreen</span>
                  </>
                )}
              </button>
            </div>
            <iframe
              id="warp-simulator-iframe"
              src="https://hsr.wishsimulator.app/"
              title="HSR Warp Simulator"
              className="warp-iframe"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              allowFullScreen
            />
          </div>

          <div className="warp-info">
            <h2>About the Simulator</h2>
            <p>
              This simulator allows you to experience the gacha system from Honkai: Star Rail.
              Try your luck and see which characters and light cones you can get!
            </p>
            <Link to="/character-list" className="btn">View All Characters</Link>
          </div>
        </div>

        <div className="warp-footer">
          <p>
            The HSR Warp Simulator is an open-source project created by{' '}
            <a
              href="https://github.com/AguzzTN54/HSR-Warp-Simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              AguzzTN54
            </a>
            . All game assets belong to miHoYo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarpSimulator;