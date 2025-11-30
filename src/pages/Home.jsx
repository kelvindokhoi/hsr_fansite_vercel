import { useState } from 'react';
import HSRLogo from '../assets/hsr_logo.png';
import PillNav from '../components/PillNav';
import GradientText from '../components/GradientText.jsx';
import DotGrid from '../components/DotGrid.jsx';
import UserMenu from '../components/UserMenu.jsx';
import '../css/Home.css';
import StellarJadePNG from '../assets/Item_Stellar_Jade.png';
import HSRLogoKafka from "../assets/HSR_Logo_Kafka.png";

function Home() {
  return (
    <div className="home-page">
      <div className="dot-grid-container">
        <DotGrid 
          dotSize={2} 
          gap={15} 
          proximity={120} 
          shockRadius={250} 
          shockStrength={5} 
          resistance={750} 
          returnDuration={1.5}
        />
      </div>
      
      <PillNav
        logo={HSRLogoKafka} 
        logoAlt="Honkai: Star Rail Logo"
        items={[
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Character List', href: '/character-list' },
          { label: 'Gacha Pulling', href: '/gacha-pulling' },
          { label: 'Credits', href: '/credits' }
        ]}
        activeHref="/" 
        className="custom-nav" 
        baseColor="#753eceff" 
        pillColor="#ffffff" 
        hoveredPillTextColor="#ffffff" 
        pillTextColor="#000000"
      />
      
      <div className="home-content">
        <GradientText 
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]} 
          animationSpeed={3} 
          showBorder={false} 
          className="Page-Title"
        >
          Honkai: Star Rail Simulation 
        </GradientText>
        
        <GradientText 
          colors={["#4079ff"]} 
          animationSpeed={3} 
          showBorder={false} 
          className="Page-Subtitle"
        >
          A <b>fan-made</b> interactive web experience inspired by the universe of Honkai: Star Rail.
        </GradientText>
      </div>
    </div>
  );
}

export default Home;