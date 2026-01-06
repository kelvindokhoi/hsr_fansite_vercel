import React from 'react';

const GachaBanner = ({ banners = [], selectedBanner, onBannerSelect }) => {
  return (
    <div className="banner-container">
      <h2>Select a Banner</h2>
      <div className="banner-options">
        {banners.map((banner) => (
          <div 
            key={banner.id}
            className={`banner-option ${selectedBanner?.id === banner.id ? 'active' : ''}`}
            onClick={() => onBannerSelect(banner)}
          >
            <img 
              src={banner.image} 
              alt={banner.name} 
              className="banner-image"
            />
            <div className="banner-info">
              <h3>{banner.name}</h3>
              <p>{banner.description}</p>
              <div className="banner-rates">
                <span>5★: {banner.rates.fiveStar}%</span>
                <span>4★: {banner.rates.fourStar}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GachaBanner;
