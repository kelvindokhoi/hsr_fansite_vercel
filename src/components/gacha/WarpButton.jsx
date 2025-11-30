import React from 'react';

const WarpButton = ({ onWarp, warpType = 'single', disabled = false, loading = false }) => {
  const buttonText = warpType === 'single' ? 'Warp x1' : 'Warp x10';
  
  return (
    <button
      className={`warp-button ${warpType} ${loading ? 'loading' : ''}`}
      onClick={onWarp}
      disabled={disabled || loading}
    >
      {loading ? 'Warping...' : buttonText}
      {warpType === 'single' && <span className="warp-cost">x1 Warp Ticket</span>}
      {warpType === 'ten' && <span className="warp-cost">x10 Warp Tickets</span>}
    </button>
  );
};

export default WarpButton;
