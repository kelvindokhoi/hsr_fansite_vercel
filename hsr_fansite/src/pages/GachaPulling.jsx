import { useState, useEffect } from 'react';
import GachaBanner from '../components/gacha/GachaBanner';
import '../css/GachaPulling.css';
import WarpButton from '../components/gacha/WarpButton';
import WarpResults from '../components/gacha/WarpResults';
import PityCounter from '../components/gacha/PityCounter';
import Inventory from '../components/gacha/Inventory';

console.log('GachaPulling component mounted');
// Mock data for banners
const BANNERS = [
  {
    id: 'character-event',
    name: 'Character Event Warp',
    description: 'Boosted 5★ characters',
    image: '/images/banners/character-event.jpg',
    rates: {
      fiveStar: 0.6,
      fourStar: 5.1,
      threeStar: 94.3
    },
    featured: {
      fiveStar: ['Character 1', 'Character 2'],
      fourStar: ['Character 3', 'Character 4', 'Character 5', 'Character 6']
    }
  },
  {
    id: 'light-cone',
    name: 'Light Cone Warp',
    description: 'Boosted 5★ Light Cones',
    image: '/images/banners/light-cone.jpg',
    rates: {
      fiveStar: 0.8,
      fourStar: 18.4,
      threeStar: 80.8
    },
    featured: {
      fiveStar: ['Light Cone 1', 'Light Cone 2'],
      fourStar: ['Light Cone 3', 'Light Cone 4', 'Light Cone 5', 'Light Cone 6']
    }
  },
  {
    id: 'standard',
    name: 'Standard Warp',
    description: 'Permanent Warp with all characters',
    image: '/images/banners/standard.jpg',
    rates: {
      fiveStar: 0.6,
      fourStar: 5.1,
      threeStar: 94.3
    },
    featured: {
      fiveStar: ['Standard Character 1', 'Standard Character 2'],
      fourStar: ['Standard Character 3', 'Standard Character 4']
    }
  }
];

// Mock item database
const ITEM_DATABASE = [
  // 5★ Characters
  { id: 'char-5-1', name: 'Kafka', type: 'Character', rarity: 5, image: '/images/characters/kafka.png' },
  { id: 'char-5-2', name: 'Silver Wolf', type: 'Character', rarity: 5, image: '/images/characters/silver-wolf.png' },
  // Add more items...
  
  // 4★ Characters
  { id: 'char-4-1', name: 'Sampo', type: 'Character', rarity: 4, image: '/images/characters/sampo.png' },
  { id: 'char-4-2', name: 'Hook', type: 'Character', rarity: 4, image: '/images/characters/hook.png' },
  // Add more items...
  
  // 3★ Light Cones
  { id: 'cone-3-1', name: 'Cornucopia', type: 'Light Cone', rarity: 3, image: '/images/cones/cornucopia.png' },
  { id: 'cone-3-2', name: 'Darting Arrow', type: 'Light Cone', rarity: 3, image: '/images/cones/darting-arrow.png' },
  // Add more items...
];

const GachaPulling = () => {
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [pityCounters, setPityCounters] = useState({
    fiveStar: 0,
    fourStar: 0,
    guaranteedFeatured: false,
    lastPityWasFeatured: false
  });
  const [warpResults, setWarpResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [inventoryFilter, setInventoryFilter] = useState(null);
  const [isPulling, setIsPulling] = useState(false);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('gachaData');
    if (savedData) {
      const { inventory, pityCounters } = JSON.parse(savedData);
      setInventory(inventory);
      setPityCounters(pityCounters);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    const dataToSave = {
      inventory,
      pityCounters,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('gachaData', JSON.stringify(dataToSave));
  }, [inventory, pityCounters]);

  const getRandomRarity = (bannerRates) => {
    const roll = Math.random() * 100;
    
    if (roll < bannerRates.fiveStar) return 5;
    if (roll < bannerRates.fiveStar + bannerRates.fourStar) return 4;
    return 3;
  };

  const getRandomItem = (rarity, banner) => {
    // Filter items by rarity
    let eligibleItems = ITEM_DATABASE.filter(item => item.rarity === rarity);
    
    // If it's a featured banner and we got a 4★ or 5★, prioritize featured items
    if (banner && rarity >= 4) {
      const featuredNames = rarity === 5 ? banner.featured.fiveStar : banner.featured.fourStar;
      const featuredItems = eligibleItems.filter(item => featuredNames.includes(item.name));
      
      // If we have a guaranteed featured or a 50/50 chance for featured
      if (rarity === 5 && (pityCounters.guaranteedFeatured || Math.random() < 0.5)) {
        eligibleItems = featuredItems.length > 0 ? featuredItems : eligibleItems;
      } else if (rarity === 4) {
        // For 4★, always have a chance to get featured
        eligibleItems = [...featuredItems, ...eligibleItems];
      }
    }
    
    // Return a random item from eligible items
    return eligibleItems[Math.floor(Math.random() * eligibleItems.length)];
  };

  const performWarp = (count) => {
    if (!selectedBanner) {
      alert('Please select a banner first!');
      return [];
    }

    const results = [];
    let newPityCounters = { ...pityCounters };
    let gotFiveStar = false;
    let gotFourStar = false;

    for (let i = 0; i < count; i++) {
      // Check for pity
      if (newPityCounters.fiveStar >= 89) {
        // Force 5★ at 90 pity
        const item = getRandomItem(5, selectedBanner);
        results.push({ ...item, isPity: true });
        gotFiveStar = true;
        newPityCounters.fiveStar = 0;
        newPityCounters.fourStar++;
        continue;
      } else if (newPityCounters.fourStar >= 9) {
        // Force 4★ at 10 pity
        const item = getRandomItem(4, selectedBanner);
        results.push({ ...item, isPity: true });
        gotFourStar = true;
        newPityCounters.fourStar = 0;
        newPityCounters.fiveStar++;
        continue;
      }

      // Normal roll
      const rarity = getRandomRarity(selectedBanner.rates);
      const item = getRandomItem(rarity, selectedBanner);
      results.push(item);

      // Update pity counters
      if (rarity === 5) {
        gotFiveStar = true;
        newPityCounters.fiveStar = 0;
        newPityCounters.fourStar++;
      } else if (rarity === 4) {
        gotFourStar = true;
        newPityCounters.fourStar = 0;
        newPityCounters.fiveStar++;
      } else {
        newPityCounters.fiveStar++;
        newPityCounters.fourStar++;
      }
    }

    // Update state
    setPityCounters(newPityCounters);
    setInventory(prev => [...prev, ...results]);
    
    return results;
  };

  const handleWarp = async (count) => {
    setIsPulling(true);
    setShowResults(false);
    
    // Add a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const results = performWarp(count);
    setWarpResults(results);
    setShowResults(true);
    setIsPulling(false);
    
    // Auto-scroll to results
    setTimeout(() => {
      const resultsElement = document.querySelector('.warp-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleBannerSelect = (banner) => {
    setSelectedBanner(banner);
    setShowResults(false);
  };

  const handleFilterChange = (rarity) => {
    setInventoryFilter(rarity);
  };

  const resetAccount = () => {
    if (window.confirm('Are you sure you want to reset your account? This will clear all your progress.')) {
      setInventory([]);
      setPityCounters({
        fiveStar: 0,
        fourStar: 0,
        guaranteedFeatured: false,
        lastPityWasFeatured: false
      });
      setWarpResults([]);
      setShowResults(false);
      localStorage.removeItem('gachaData');
    }
  };

  return (
    <div className="gacha-container">
      <header className="gacha-header">
        <h1>Warp Simulator</h1>
        <div className="currency-display">
          <span className="stellar-jade">0</span>
          <span className="warp-tickets">Warp Tickets: ∞</span>
        </div>
      </header>

      <main>
        <GachaBanner 
          banners={BANNERS} 
          selectedBanner={selectedBanner} 
          onBannerSelect={handleBannerSelect} 
        />

        {selectedBanner && (
          <div className="warp-interface">
            <div className="pity-counters">
              <PityCounter 
                currentPity={pityCounters.fiveStar} 
                pityType="5★" 
                maxPity={90} 
              />
              <PityCounter 
                currentPity={pityCounters.fourStar} 
                pityType="4★" 
                maxPity={10} 
              />
            </div>

            <div className="warp-buttons">
              <WarpButton 
                onWarp={() => handleWarp(1)} 
                warpType="single" 
                disabled={isPulling}
                loading={isPulling}
              />
              <WarpButton 
                onWarp={() => handleWarp(10)} 
                warpType="ten" 
                disabled={isPulling}
                loading={isPulling}
              />
            </div>
          </div>
        )}

        {showResults && warpResults.length > 0 && (
          <WarpResults 
            results={warpResults} 
            isNewPity={warpResults.some(item => item.isPity)} 
          />
        )}

        <Inventory 
          items={inventory} 
          onFilterChange={handleFilterChange} 
          activeFilter={inventoryFilter} 
        />
      </main>

      <footer className="gacha-footer">
        <button 
          className="reset-button" 
          onClick={resetAccount}
          title="Reset all progress"
        >
          Reset Account
        </button>
        <p className="disclaimer">
          This is a fan-made simulator and is not affiliated with miHoYo or Honkai: Star Rail.
        </p>
      </footer>
    </div>
  );
};

export default GachaPulling;