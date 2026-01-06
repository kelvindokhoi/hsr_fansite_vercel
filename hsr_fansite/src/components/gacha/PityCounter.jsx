import React from 'react';

const PityCounter = ({ currentPity, pityType = '5★', maxPity = 90 }) => {
  const percentage = Math.min(100, (currentPity / maxPity) * 100);
  
  return (
    <div className="pity-counter">
      <div className="pity-header">
        <span className="pity-type">{pityType} Pity</span>
        <span className="pity-count">{currentPity}/{maxPity}</span>
      </div>
      <div className="pity-bar-container">
        <div 
          className="pity-bar" 
          style={{ width: `${percentage}%` }}
          aria-valuenow={currentPity}
          aria-valuemin="0"
          aria-valuemax={maxPity}
        ></div>
      </div>
      {currentPity >= maxPity - 10 && (
        <div className="pity-warning">
          {pityType} guaranteed in {maxPity - currentPight} pulls!
        </div>
      )}
    </div>
  );
};

export default PityCounter;
