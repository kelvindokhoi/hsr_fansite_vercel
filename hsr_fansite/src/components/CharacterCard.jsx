import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/CharacterCard.css';

const CharacterCard = ({ character }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [portraitPath, setPortraitPath] = useState('');
  const [avatarPath, setAvatarPath] = useState('');
  const [elementPath, setElementPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/characters/${character.imageName}`);
  };

  const rarityClass = character.rarity === 5 ? 'five-star' : 'four-star';

const getFallbackPath = (type) => {
  switch(type) {
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
useEffect(() => {
  let isMounted = true;
  const abortController = new AbortController();

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const [portrait, avatar] = await Promise.all([
        getImagePath(character.imageName, 'portrait'),
        getImagePath(character.imageName, 'avatar')
      ]);

      if (isMounted) {
        setPortraitPath(portrait);
        setAvatarPath(avatar);
        setElementPath(`/images/${character.element}.png`);
      }
    } catch (error) {
      console.error('Error loading images:', error);
      if (isMounted) {
        setPortraitPath('/images/placeholder_portrait.png');
        setAvatarPath('/images/placeholder_avatar.png');
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
    abortController.abort();
  };
}, [character.imageName, character.element]);

  if (isLoading) {
    return <div className="character-card loading">Loading...</div>;
  }

  return (
    <div
      className={`character-card ${rarityClass}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`Character: ${character.name}, ${character.rarity} star, ${character.element} element, ${character.path} path`}
      role="button"
      tabIndex="0"
    >
      <div className="card-content">
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

      {isHovered && (
        <div className="tooltip">
          <div className="tooltip-header">
            <img
              src={avatarPath}
              alt={`${character.name} avatar`}
              className="avatar-image"
              loading="lazy"
              onError={(e) => {
                e.target.src = '/images/placeholder_avatar.png';
              }}
            />
            <div className="tooltip-name-rarity">
              <span className="tooltip-name">{character.name}</span>
              <div className="tooltip-rarity">
                {Array(character.rarity).fill('★').join('')}
              </div>
            </div>
          </div>

          <div className="tooltip-details">
            <img
              src={elementPath}
              alt={`${character.element} element`}
              className="tooltip-element"
              onError={(e) => {
                e.target.src = '/images/Unknown.png';
              }}
            />
            <span className="tooltip-path-text">{character.path}</span>
          </div>

          <div className="tooltip-description">
            {character.description || "No description available"}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterCard;