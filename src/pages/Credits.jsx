import { Link } from 'react-router-dom';
import GradientText from '../components/GradientText';
import DotGrid from '../components/DotGrid';
import UserMenu from '../components/UserMenu';
import StellarJadePNG from '../assets/Item_Stellar_Jade.png';
import PillNav from '../components/PillNav';
import '../css/Credits.css';

function Credits() {
  return (
    <div className="credits-page">
      <DotGrid
        dotSize={2}
        gap={15}
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
      />

      <PillNav
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Character List', href: '/character-list' },
          { label: 'Edit Characters', href: '/edit-characters' },
          { label: 'Gacha Pulling', href: '/gacha-pulling' },
          { label: 'Credits', href: '/credits' }
        ]}
        activeHref="/credits"
        className="custom-nav"
        baseColor="#753eceff"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
      />

      <div className="credits-content">
        <div id="credits-title">
          <GradientText
            colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
            animationSpeed={3}
            showBorder={false}
            className="Page-Title"
          >
            Credits & Acknowledgments
          </GradientText>
        </div>
        <div className="credits-text">
          <section className="credits-section">
            <h2>Open Source Projects</h2>
            <ul>
              <li>
                <a href="https://github.com/Mantan21/HSR-Warp-Simulator" target="_blank" rel="noopener noreferrer">
                  HSR Warp Simulator
                </a> - Used for the gacha pulling simulation
              </li>
              <li>
                <a href="https://reactbits.dev/" target="_blank" rel="noopener noreferrer">
                  ReactBits UI Components
                </a> - Used as a foundation for several UI components
              </li>
              <li>
                <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">
                  React
                </a> - JavaScript library for building user interfaces
              </li>
              <li>
                <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">
                  Vite
                </a> - Next Generation Frontend Tooling
              </li>
            </ul>
          </section>

          <section className="credits-section">
            <h2>Cloud Infrastructure</h2>
            <ul>
              <li>
                <a href="https://www.oracle.com/cloud/" target="_blank" rel="noopener noreferrer">
                  Oracle Cloud
                </a> - Hosting for the high-performance PHP backend and asset storage
              </li>
              <li>
                <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer">
                  Supabase
                </a> - Cloud-native PostgreSQL database and authentication engine
              </li>
              <li>
                <a href="https://www.duckdns.org/" target="_blank" rel="noopener noreferrer">
                  DuckDNS
                </a> - Dynamic DNS service for backend accessibility
              </li>
              <li>
                <a href="https://letsencrypt.org/" target="_blank" rel="noopener noreferrer">
                  Let's Encrypt
                </a> - Providing secure SSL certificates via Certbot
              </li>
              <li>
                <a href="https://www.cloudflare.com/products/turnstile/" target="_blank" rel="noopener noreferrer">
                  Cloudflare Turnstile
                </a> - Invisible, privacy-focused bot protection
              </li>
            </ul>
          </section>

          <section className="credits-section">
            <h2>AI Assistance</h2>
            <p>This project was made possible with the help of the following AI assistants:</p>
            <ul>
              <li><strong>Antigravity AI (Google DeepMind)</strong> - Lead backend migration, SSL security integration, and cloud optimization</li>
              <li><strong>Windsurf AI</strong> - For initial code generation and UI component development</li>
              <li><strong>Claude AI</strong> - For structural planning and technical advice</li>
            </ul>
          </section>

          <section className="credits-section">
            <h2>Assets & Resources</h2>
            <ul>
              <li>All game assets are property of miHoYo/HoYoverse and are used under fair use</li>
              <li>Icons from various open source icon libraries</li>
            </ul>
          </section>

          <section className="disclaimer">
            <h3>Disclaimer</h3>
            <p>
              This is a fan-made project and is not affiliated with or endorsed by miHoYo or HoYoverse.
              Honkai: Star Rail is a registered trademark of miHoYo Co., Ltd. All game content and materials
              are trademarks and copyrights of their respective owners.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Credits;
