import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PillNav from '../components/PillNav';
import CharacterList from '../components/CharacterList';
import GradientText from '../components/GradientText';
import UserMenu from '../components/UserMenu';
import { useAuth } from '../context/AuthContext';
import HSRLogoEvernight from '../assets/HSR_Logo_Evernight.png';
import StellarJadePNG from '../assets/Item_Stellar_Jade.png';
import '../css/CharacterListPage.css';

const API_URL = 'http://localhost/api';

const CharacterListPage = () => {
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useAuth();

  // Define navigation items
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Character List', href: '/character-list' },
    { label: 'Edit Characters', href: '/edit-characters' },
    { label: 'Gacha Pulling', href: '/gacha-pulling' },
    { label: 'Credits', href: '/credits' }
  ];

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Please log in to view characters');
          setIsLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/management/getCharacter.php`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          setCharacters(response.data.characters || []);
        } else {
          setError(response.data.error || 'Failed to load characters');
        }
      } catch (err) {
        console.error('Error fetching characters:', err);
        setError(err.response?.data?.error || 'Failed to load characters. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="page-container">
        <PillNav
          logo={HSRLogoEvernight}
          logoAlt="Honkai: Star Rail Logo"
          items={navItems}
          activeHref="/character-list"
          baseColor="#753eceff"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#000000"
        />
        <div className="loading">Loading characters...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <PillNav
          logo={HSRLogoEvernight}
          logoAlt="Honkai: Star Rail Logo"
          items={navItems}
          activeHref="/character-list"
          baseColor="#753eceff"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#000000"
        />
        <div className="error">
          {error === "Not authenticated"
            ? "Please log in to view characters"
            : `Error loading characters: ${error}`}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PillNav
        logo={HSRLogoEvernight}
        logoAlt="Honkai: Star Rail Logo"
        items={navItems}
        activeHref="/character-list"
        baseColor="#753eceff"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
      />
      <div className="character-list-page">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="Page-Title Character-List-Page-Title"
        >
          Character List
        </GradientText>
        <CharacterList characters={characters} />
      </div>
    </div>
  );
};

export default CharacterListPage;
