import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PillNav from '../components/PillNav';
import GradientText from '../components/GradientText.jsx';
import DotGrid from '../components/DotGrid.jsx';
import '../css/EditCharactersPage.css';
import HSRLogoMarch7 from "../assets/HSR_Logo_March7.png";

// Image loading utilities
const getFallbackPath = (type) => {
  switch (type) {
    case 'portrait':
      return '/images/placeholder_portrait.png';
    case 'avatar':
      return '/images/placeholder_avatar.png';
    default:
      return '/images/Unknown.png';
  }
};

const getImagePath = (baseName, type) => {
  return new Promise((resolve) => {
    const extensions = ['png', 'jpg'];
    let currentIndex = 0;

    const tryNext = async () => {
      if (currentIndex >= extensions.length) {
        console.log(`No valid image found for ${baseName}_${type}, using fallback`);
        resolve(getFallbackPath(type));
        return;
      }

      const ext = extensions[currentIndex++];
      // Don't encode the entire path, just create it directly
      const path = `/images/${baseName}_${type}.${ext}`;
      console.log(`Trying to load: ${path}`);

      try {
        const img = new Image();
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 1000)
        );

        const loadImage = new Promise((resolve, reject) => {
          img.onload = () => resolve(path);
          img.onerror = () => reject(new Error('load error'));
          img.src = path;
        });

        const result = await Promise.race([loadImage, timeout]);
        console.log(`Found image at: ${result}`);
        resolve(result);
      } catch (error) {
        console.log(`Failed to load: ${path} - ${error.message}`);
        tryNext();
      }
    };

    tryNext();
  });
};

// Character Card Component with image loading
const CharacterCard = ({ character, onEdit, onDelete }) => {
  const [portraitPath, setPortraitPath] = useState('');
  const [elementPath, setElementPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      try {
        setIsLoading(true);
        const imageName = character.imageName || character.name.replace(/\s+/g, '_');
        const [portrait] = await Promise.all([
          getImagePath(imageName, 'portrait')
        ]);

        if (isMounted) {
          setPortraitPath(portrait);
          setElementPath(`/images/${character.element}.png`);
        }
      } catch (error) {
        console.error('Error loading images:', error);
        if (isMounted) {
          setPortraitPath('/images/placeholder_portrait.png');
          setElementPath('/images/Unknown.png');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [character.name, character.element, character.imageName]);

  const rarityClass = character.rarity === 5 ? 'five-star' : 'four-star';

  if (isLoading) {
    return (
      <div className="character-card loading">
        <div className="loading-placeholder">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`character-card ${rarityClass}`}>
      <div className="portrait-section">
        <img
          src={elementPath}
          alt={`${character.element} element`}
          className="element-icon"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/images/Unknown.png';
          }}
        />

        <img
          src={portraitPath}
          alt={`${character.name} portrait`}
          className="portrait-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = '/images/placeholder_portrait.png';
          }}
        />

        <div className="name-mask">
          <span className="character-name">{character.name}</span>
        </div>
      </div>

      {/* Overlay Info Section */}
      <div className="overlay-info-section">
        <h4 className="overlay-character-name">{character.name}</h4>
        <p className="character-details">{character.element} • {character.path} • {character.rarity}★</p>
        {character.description && (
          <p className="character-description">{character.description}</p>
        )}
      </div>

      {/* Overlay Actions Section */}
      <div className="overlay-actions-section">
        <button
          onClick={() => onEdit(character)}
          className="edit-btn"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(character.id)}
          className="delete-btn"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const EditCharactersPage = () => {
  const { user } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    element: '',
    path: '',
    rarity: 5,
    description: '',
    image: null
  });

  const elements = ['Fire', 'Ice', 'Imaginary', 'Lightning', 'Physical', 'Quantum', 'Wind'];
  const paths = ['Abundance', 'Destruction', 'Erudition', 'Harmony', 'Nihility', 'Preservation', 'Hunt', 'Remembrance'];
  const rarities = [4, 5];

  // Filter state for existing characters
  const [characterFilters, setCharacterFilters] = useState({
    elements: [],
    paths: [],
    rarities: [4, 5],
    search: ''
  });

  // State for filters collapse
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  useEffect(() => {
    console.log('User object:', user); // Debug log
    if (!user) {
      setError('Access denied. Please log in.');
      setLoading(false);
      return;
    }

    // Check for admin role using multiple possible fields
    const isAdmin = user.role_name === 'admin' || user.is_admin === 1 || user.role === 'admin';

    if (!isAdmin) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }

    fetchCharacters();
  }, [user]);

  const fetchCharacters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost/api/management/getCharacter.php', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setCharacters(data.characters || []);
      } else {
        setError(data.message || data.error || 'Failed to fetch characters');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    if (editingCharacter) {
      data.append('id', editingCharacter.id);
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingCharacter
        ? 'http://localhost/api/management/update_character.php'
        : 'http://localhost/api/management/addCharacter.php';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (result.success) {
        console.log("Upload success. Server response:", result);
        await fetchCharacters();
        resetForm();
      } else {
        console.error("Upload failed. Server response:", result);
        setError(result.message || 'Operation failed');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this character?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost/api/management/delete_character.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("Delete failed. Invalid JSON:", text);
        setError('Server returned invalid data. Check console.');
        return;
      }

      console.log("Delete response:", result);

      if (result.success) {
        await fetchCharacters();
      } else {
        console.error("Delete failed:", result);
        setError(result.message || 'Delete failed');
      }
    } catch (err) {
      console.error("Delete network error:", err);
      setError('Error connecting to server');
    }
  };

  const startEdit = (character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      element: character.element,
      path: character.path,
      rarity: character.rarity,
      description: character.description || '',
      image: null
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      element: '',
      path: '',
      rarity: 5,
      description: '',
      image: null
    });
    setEditingCharacter(null);
    setIsEditing(false);
  };

  // Filter functions
  const handleFilterChange = (filterType, value) => {
    setCharacterFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleElementFilter = (element) => {
    setCharacterFilters(prev => ({
      ...prev,
      elements: prev.elements.includes(element)
        ? prev.elements.filter(e => e !== element)
        : [...prev.elements, element]
    }));
  };

  const togglePathFilter = (path) => {
    setCharacterFilters(prev => ({
      ...prev,
      paths: prev.paths.includes(path)
        ? prev.paths.filter(p => p !== path)
        : [...prev.paths, path]
    }));
  };

  const toggleRarityFilter = (rarity) => {
    setCharacterFilters(prev => ({
      ...prev,
      rarities: prev.rarities.includes(rarity)
        ? prev.rarities.filter(r => r !== rarity)
        : [...prev.rarities, rarity]
    }));
  };

  // Filter characters based on filters
  const filteredCharacters = characters.filter(character => {
    const matchesElements = characterFilters.elements.length === 0 || characterFilters.elements.includes(character.element);
    const matchesPaths = characterFilters.paths.length === 0 || characterFilters.paths.includes(character.path);
    const matchesRarity = characterFilters.rarities.includes(character.rarity);
    const matchesSearch = characterFilters.search === '' ||
      character.name.toLowerCase().includes(characterFilters.search.toLowerCase());

    return matchesElements && matchesPaths && matchesRarity && matchesSearch;
  });

  if (loading) return <div className="loading">Loading...</div>;
  if (error && (!user || !(user.role_name === 'admin' || user.is_admin === 1 || user.role === 'admin'))) {
    return (
      <div className="edit-characters-page">
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
          activeHref="/edit-characters"
          className="custom-nav"
          baseColor="#753eceff"
          pillColor="#ffffff"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#000000"
        />

        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-characters-page">
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
        activeHref="/edit-characters"
        className="custom-nav"
        baseColor="#753eceff"
        pillColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        pillTextColor="#000000"
      />

      <div className="edit-characters-content">
        <GradientText
          colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
          animationSpeed={3}
          showBorder={false}
          className="Page-Title"
        >
          Edit Characters
        </GradientText>

        {error && <div className="error-message">{error}</div>}

        <div className="edit-characters-container">
          {/* Character Form */}
          <div className="character-form">
            <h3>{isEditing ? 'Edit Character' : 'Add New Character'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Element:</label>
                  <select
                    name="element"
                    value={formData.element}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Element</option>
                    {elements.map(element => (
                      <option key={element} value={element}>{element}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Path:</label>
                  <select
                    name="path"
                    value={formData.path}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Path</option>
                    {paths.map(path => (
                      <option key={path} value={path}>{path}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rarity:</label>
                  <select
                    name="rarity"
                    value={formData.rarity}
                    onChange={handleInputChange}
                    required
                  >
                    {rarities.map(rarity => (
                      <option key={rarity} value={rarity}>{rarity}★</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {formData.image && (
                  <div className="image-preview">
                    <img src={URL.createObjectURL(formData.image)} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  {isEditing ? 'Update Character' : 'Add Character'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="cancel-btn">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Characters List */}
          <div className="characters-list">
            <h3>Existing Characters</h3>

            {/* Filters Section */}
            <div className={`character-filters ${!filtersExpanded ? 'collapsed' : ''}`}>
              <div className="filter-header" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setFiltersExpanded(!filtersExpanded);
              }}>
                <h4>Filters & Search</h4>
                <span className={`collapse-icon ${filtersExpanded ? 'expanded' : 'collapsed'}`}>▼</span>
              </div>

              <div className="filter-content">
                <div className="filter-search">
                  <input
                    type="text"
                    placeholder="Search characters..."
                    value={characterFilters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="search-input"
                  />
                </div>

                <div className="filter-group">
                  <label>Elements:</label>
                  <div className="filter-buttons">
                    {elements.map(element => (
                      <button
                        key={element}
                        className={`filter-btn ${characterFilters.elements.includes(element) ? 'active' : ''}`}
                        onClick={() => toggleElementFilter(element)}
                      >
                        {element}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Paths:</label>
                  <div className="filter-buttons">
                    {paths.map(path => (
                      <button
                        key={path}
                        className={`filter-btn ${characterFilters.paths.includes(path) ? 'active' : ''}`}
                        onClick={() => togglePathFilter(path)}
                      >
                        {path}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-group">
                  <label>Rarity:</label>
                  <div className="filter-buttons">
                    {rarities.map(rarity => (
                      <button
                        key={rarity}
                        className={`filter-btn ${characterFilters.rarities.includes(rarity) ? 'active' : ''}`}
                        onClick={() => toggleRarityFilter(rarity)}
                      >
                        {rarity}★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-results">
                  <span>{filteredCharacters.length} of {characters.length} characters</span>
                </div>
              </div>
            </div>

            <div className="characters-grid">
              {filteredCharacters.map(character => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCharactersPage;