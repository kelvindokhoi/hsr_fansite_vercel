import React, { useState, useEffect, useMemo } from 'react';
import CharacterCard from './CharacterCard';
import '../css/CharacterList.css';

const CharacterList = ({ characters }) => {
  const [activeFilters, setActiveFilters] = useState({
    elements: [],
    paths: [],
    rarities: [4, 5],
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const charactersPerPage = 50;
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Get unique elements and paths for filter buttons
  const elements = useMemo(() =>
    [...new Set(characters.map(char => char.element))], [characters]);

  const paths = useMemo(() =>
    [...new Set(characters.map(char => char.path))], [characters]);

  // Filter and search logic
  const filteredCharacters = useMemo(() => {
    return characters.filter(char => {
      // Search filter (case insensitive)
      if (activeFilters.search &&
          !char.name.toLowerCase().includes(activeFilters.search.toLowerCase())) {
        return false;
      }

      // Element filter
      if (activeFilters.elements.length > 0 &&
          !activeFilters.elements.includes(char.element)) {
        return false;
      }

      // Path filter
      if (activeFilters.paths.length > 0 &&
          !activeFilters.paths.includes(char.path)) {
        return false;
      }

      // Rarity filter
      if (!activeFilters.rarities.includes(char.rarity)) {
        return false;
      }

      return true;
    });
  }, [characters, activeFilters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCharacters.length / charactersPerPage);
  const paginatedCharacters = useMemo(() => {
    const startIndex = (currentPage - 1) * charactersPerPage;
    return filteredCharacters.slice(startIndex, startIndex + charactersPerPage);
  }, [filteredCharacters, currentPage]);

  // Toggle filter functions
  const toggleElement = (element) => {
    setActiveFilters(prev => ({
      ...prev,
      elements: prev.elements.includes(element)
        ? prev.elements.filter(e => e !== element)
        : [...prev.elements, element]
    }));
    setCurrentPage(1);
  };

  const togglePath = (path) => {
    setActiveFilters(prev => ({
      ...prev,
      paths: prev.paths.includes(path)
        ? prev.paths.filter(p => p !== path)
        : [...prev.paths, path]
    }));
    setCurrentPage(1);
  };

  const toggleRarity = (rarity) => {
    setActiveFilters(prev => ({
      ...prev,
      rarities: prev.rarities.includes(rarity)
        ? prev.rarities.filter(r => r !== rarity)
        : [...prev.rarities, rarity]
    }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setActiveFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
    setCurrentPage(1);
  };

  // Reset filters
  const resetFilters = () => {
    setActiveFilters({
      elements: [],
      paths: [],
      rarities: [4, 5],
      search: ''
    });
    setCurrentPage(1);
  };

  // Available elements and paths for filtering
  const availableElements = ['Fire', 'Ice', 'Imaginary', 'Lightning', 'Physical', 'Quantum', 'Wind'];
  const availablePaths = ['Abundance', 'Destruction', 'Erudition', 'Harmony', 'Nihility', 'Preservation', 'Hunt','Remembrance'];

  return (
    <div className="character-list-container">
      {/* Filter Controls */}
      <div className={`filter-controls ${!filtersExpanded ? 'collapsed' : ''}`}>
        <div className="filter-header" onClick={() => setFiltersExpanded(!filtersExpanded)}>
          <h3>Filters & Search</h3>
          <span className={`collapse-icon ${filtersExpanded ? 'expanded' : 'collapsed'}`}>▼</span>
        </div>
        
        {filtersExpanded && (
        <div className="filter-content">
          <div className="filter-group">
          <h3>Element</h3>
          <div className="filter-buttons">
            {availableElements.map(element => (
              <button
                key={element}
                className={`filter-button ${activeFilters.elements.includes(element) ? 'active' : ''}`}
                onClick={() => toggleElement(element)}
                aria-pressed={activeFilters.elements.includes(element)}
              >
                <img
                  src={`/images/${element}.png`}
                  alt={`${element} element`}
                  className="filter-icon"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>Path</h3>
          <div className="filter-buttons">
            {availablePaths.map(path => (
              <button
                key={path}
                className={`filter-button ${activeFilters.paths.includes(path) ? 'active' : ''}`}
                onClick={() => togglePath(path)}
                aria-pressed={activeFilters.paths.includes(path)}
              >
                {path}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>Rarity</h3>
          <div className="filter-buttons">
            {[4, 5].map(rarity => (
              <button
                key={rarity}
                className={`filter-button ${activeFilters.rarities.includes(rarity) ? 'active' : ''}`}
                onClick={() => toggleRarity(rarity)}
                aria-pressed={activeFilters.rarities.includes(rarity)}
              >
                {Array(rarity).fill('★').join('')}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group search-group">
          <h3>Search</h3>
          <input
            type="text"
            placeholder="Character name..."
            value={activeFilters.search}
            onChange={handleSearch}
            className="search-input"
            aria-label="Search characters by name"
          />
        </div>

        <button onClick={resetFilters} className="reset-button">
          Reset Filters
        </button>
        </div>
        )}
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredCharacters.length} of {characters.length} characters
      </div>

      {/* Character Grid */}
      <div className="character-grid">
        {paginatedCharacters.length > 0 ? (
          paginatedCharacters.map(character => (
            <CharacterCard key={character.name} character={character} />
          ))
        ) : (
          <div className="no-results">No characters match your filters</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ← Previous
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return pageNum <= totalPages ? (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? 'active' : ''}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            ) : null;
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <span className="pagination-ellipsis">...</span>
          )}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterList;
