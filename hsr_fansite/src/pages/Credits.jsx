import { Link } from 'react-router-dom';
import GradientText from '../components/GradientText';
import DotGrid from '../components/DotGrid';
import UserMenu from '../components/UserMenu';
import StellarJadePNG from '../assets/Item_Stellar_Jade.png';
import HSRLogoRobin from '../assets/HSR_Logo_Robin1.png'
import HSRLogoMarch7 from "../assets/HSR_Logo_March7.png";
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
        logo={HSRLogoRobin}
        logoAlt="Honkai: Star Rail Logo"
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
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="Page-Title"
        >
          Credits & Acknowledgments
        </GradientText>

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
            <h2>AI Assistance</h2>
            <p>This project was made possible with the help of the following AI assistants:</p>
            <ul>
              <li><strong>Windsurf AI</strong> - For code generation and debugging assistance</li>
              <li><strong>Claude AI</strong> - For project planning and architectural advice</li>
              <li><strong>Mistral AI</strong> - For creative suggestions and UI/UX improvements</li>
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
