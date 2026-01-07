import PillNav from '../components/PillNav';
import GradientText from '../components/GradientText';
import DotGrid from '../components/DotGrid';
import '../css/About.css';

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
            Welcome to the Honkai: Star Rail Fan Site! This interactive web application brings
            the universe of Honkai: Star Rail to life with stunning visuals, engaging features,
            and an authentic gacha experience.
          </p>

          <h2 className="about-heading">🌟 Features</h2>
          <ul>
            <li>Interactive character roster with detailed profiles</li>
            <li>Realistic gacha pulling simulation with warp mechanics</li>
            <li>Warp Simulator with visual effects and animations</li>
            <li>User authentication with Cloudflare Turnstile bot protection</li>
            <li>Optimized image delivery system with automatic format detection</li>
            <li>Responsive design that works on all devices</li>
            <li>Stunning visual effects and animations</li>
          </ul>

          <h2 className="about-heading">🛠️ Technologies Used</h2>
          <ul>
            <li><strong>Frontend:</strong> React 18 with Vite, GSAP for animations</li>
            <li><strong>Backend API:</strong> PHP 8.x hosted on Oracle Cloud (Ubuntu VM)</li>
            <li><strong>Database:</strong> Supabase (PostgreSQL) in the cloud</li>
            <li><strong>Security:</strong> Cloudflare Turnstile, Let's Encrypt SSL (Certbot)</li>
            <li><strong>State Management:</strong> React Context API</li>
            <li><strong>UI Architecture:</strong> Custom-built responsive components</li>
          </ul>

          <h2 className="about-heading">☁️ Cloud Integration</h2>
          <p>
            This project has evolved into a robust hybrid cloud application. The frontend is
            seamlessly deployed on Vercel, while the backend API and high-resolution assets
            are managed on a dedicated Oracle Cloud instance. Secure data persistence is
            handled by Supabase, ensuring a safe and lightning-fast experience for all users.
          </p>

          <h2 className="about-heading">🎮 How to Use</h2>
          <p>
            Navigate through the site using the menu above. Explore characters,
            simulate warps, and experience the gacha system—all powered by a
            modern cloud-native backend!
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