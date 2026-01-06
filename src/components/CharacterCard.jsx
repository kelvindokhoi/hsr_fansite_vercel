import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageQueue } from '../lib/imageQueue';
import '../css/CharacterCard.css';

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || '';

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
    switch (type) {
      case 'portrait':
        return `${IMAGE_BASE_URL}/images/placeholder_portrait.png`;
      case 'avatar':
        return `${IMAGE_BASE_URL}/images/placeholder_avatar.png`;
      default:
        return `${IMAGE_BASE_URL}/images/Unknown.png`;
    }
  };

  const getImagePath = (baseName, type) => {
    // If we have the specific extension from the DB, use it directly (MUCH FASTER)
    if (character.imageExtension) {
      const ext = character.imageExtension;
      return `${IMAGE_BASE_URL}/images/${baseName}_${type}.${ext}`;
    }

    return imageQueue.add(() => {
      const extensions = ['png', 'jpg', 'webp'];
      const paths = extensions.map(ext => `${IMAGE_BASE_URL}/images/${baseName}_${type}.${ext}`);

      return new Promise((resolve) => {
        const loadAttempt = async (path) => {
          return new Promise((res, rej) => {
            const img = new Image();
            const timeout = setTimeout(() => {
              img.src = ''; // Cancel loading
              rej(new Error('timeout'));
            }, 5000);

            img.onload = () => {
              clearTimeout(timeout);
              res(path);
            };
            img.onerror = () => {
              clearTimeout(timeout);
              rej(new Error('load error'));
            };
            img.src = path;
          });
        };

        // Try all paths in parallel, take the first one that succeeds
        Promise.any(paths.map(loadAttempt))
          .then(resolve)
          .catch(() => {
            console.log(`No valid image found for ${baseName}_${type}, using fallback`);
            resolve(getFallbackPath(type));
          });
      });
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
          setElementPath(`${IMAGE_BASE_URL}/images/${character.element}.png`);
        }
      } catch (error) {
        console.error('Error loading images:', error);
        if (isMounted) {
          setPortraitPath(`${IMAGE_BASE_URL}/images/placeholder_portrait.png`);
          setAvatarPath(`${IMAGE_BASE_URL}/images/placeholder_avatar.png`);
          setElementPath(`${IMAGE_BASE_URL}/images/Unknown.png`);
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
            e.target.src = `${IMAGE_BASE_URL}/images/Unknown.png`;
          }}
        />

        <img
          src={portraitPath}
          alt={`${character.name} portrait`}
          className="portrait-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = `${IMAGE_BASE_URL}/images/placeholder_portrait.png`;
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
                e.target.src = `${IMAGE_BASE_URL}/images/placeholder_avatar.png`;
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
                e.target.src = `${IMAGE_BASE_URL}/images/Unknown.png`;
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