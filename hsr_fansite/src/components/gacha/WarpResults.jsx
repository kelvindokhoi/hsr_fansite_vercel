import React from 'react';

const RarityDisplay = ({ rarity }) => {
  const rarityClass = `rarity-${rarity}`;
  return <span className={`rarity ${rarityClass}`}>{rarity}★</span>;
};

const WarpItem = ({ item }) => {
  return (
    <div className="warp-item">
      <div className="item-image">
        <img src={item.image} alt={item.name} />
        <RarityDisplay rarity={item.rarity} />
      </div>
      <div className="item-details">
        <h4>{item.name}</h4>
        <p className="item-type">{item.type}</p>
      </div>
    </div>
  );
};

const WarpResults = ({ results, isNewPity = false }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className={`warp-results ${isNewPity ? 'new-pity' : ''}`}>
      <h3>{isNewPity ? 'Pity Pull!' : 'Warp Results'}</h3>
      <div className="results-grid">
        {results.map((item, index) => (
          <WarpItem key={`${item.id}-${index}`} item={item} />
        ))}
      </div>
    </div>
  );
};

export default WarpResults;
