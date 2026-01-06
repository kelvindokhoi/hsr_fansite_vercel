import { useState } from 'react';
import HSRLogo from '../assets/hsr_logo.png';
import PillNav from '../components/PillNav';
import GradientText from '../components/GradientText.jsx';
import DotGrid from '../components/DotGrid.jsx';
import UserMenu from '../components/UserMenu.jsx';
import '../css/About.css';
import StellarJadePNG from '../assets/Item_Stellar_Jade.png';
import HSRLogoMarch7 from "../assets/HSR_Logo_March7.png";

function About() {
  return (
    <div className="about-page">
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
        logo={HSRLogoMarch7}
        logoAlt="Honkai: Star Rail Logo"
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Character List', href: '/character-list' },
          { label: 'Edit Characters', href: '/edit-characters' },
          { label: 'Gacha Pulling', href: '/gacha-pulling' },
          { label: 'Credits', href: '/credits' }
        ]}
        activeHref="/about"
        className="custom-nav"
        baseColor="#753eceff"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
      />

      <div className="about-content">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="Page-Title"
        >
          About This Project
        </GradientText>

        <div className="about-text">
          <p>
            Welcome to the Honkai: Star Rail Fan Site! This project was created by passionate fans for the community to explore and enjoy the rich world of Honkai: Star Rail.
          </p>
          <p>
            Our goal is to provide an interactive and immersive experience that celebrates the characters, stories, and gameplay of Honkai: Star Rail.
          </p>

          <h2 className="about-heading">🌟 Features</h2>
          <ul>
            <li>Interactive character roster with detailed profiles</li>
            <li>Realistic gacha pulling simulation with warp mechanics</li>
            <li>Warp Simulator with visual effects and animations</li>
            <li>In-game music player with multiple tracks from the official soundtrack</li>
            <li>User authentication system</li>
            <li>Responsive design that works on all devices</li>
            <li>Stunning visual effects and animations</li>
          </ul>
          <p className="note">
            <strong>Tip:</strong> Access the music player in the top-left corner to control the background music while browsing.
          </p>

          <h2 className="about-heading">🛠️ Technologies Used</h2>
          <ul>
            <li><strong>Frontend:</strong> React 18 with Vite</li>
            <li><strong>State Management:</strong> React Context API</li>
            <li><strong>Styling:</strong> CSS Modules, Custom Animations</li>
            <li><strong>Routing:</strong> React Router v6</li>
            <li><strong>UI Components:</strong> Custom-built with React</li>
            <li><strong>Build Tool:</strong> Vite</li>
          </ul>

          <h2 className="about-heading">🎮 How to Use</h2>
          <p>
            Navigate through the site using the menu above. Explore characters,
            simulate warps, and experience the gacha system without spending any Stellar Jade!
          </p>

          <p style={{ marginTop: '2rem', fontStyle: 'italic', marginBottom: '3rem' }}>
            Made with ❤️ by K.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;