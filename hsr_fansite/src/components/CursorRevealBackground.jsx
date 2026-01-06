import { useState, useEffect } from 'react';
import '../css/CursorRevealBackground.css';

const CursorRevealBackground = ({ backgroundImage, radius = 200, children }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="cursor-reveal-container">
      <div
        className="cursor-reveal-bg"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          WebkitMaskImage: `radial-gradient(circle ${radius}px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
          maskImage: `radial-gradient(circle ${radius}px at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent 100%)`,
        }}
      />
      <div className="cursor-reveal-overlay" />
      <div className="cursor-reveal-content">
        {children}
      </div>
    </div>
  );
};

export default CursorRevealBackground;