// src/pages/WarpSimulator.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PillNav from '../components/PillNav';
import GradientText from '../components/GradientText';
import UserMenu from '../components/UserMenu';
import HSRLogoKafka from '../assets/HSR_Logo_Kafka.png';
import HSRLogoPompom from '../assets/HSR_Logo_Pompom.png';
import StellarJadePNG from '../assets/Item_Stellar_Jade.png';
import '../css/WarpSimulator.css';

const WarpSimulator = () => {
  return (
    <div className="warp-simulator-page">
      <PillNav
        logo={HSRLogoPompom}
        logoAlt="Honkai: Star Rail Logo"
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Character List', href: '/character-list' },
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
          <div className="warp-frame-container">
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