import React from 'react';

const RarityFilter = ({ activeRarity, onFilterChange }) => {
  const rarities = ['All', '3★', '4★', '5★'];
  
  return (
    <div className="rarity-filter">
      {rarities.map((rarity) => (
        <button
          key={rarity}
          className={`filter-btn ${activeRarity === rarity ? 'active' : ''}`}
          onClick={() => onFilterChange(rarity === 'All' ? null : rarity)}
        >
          {rarity}
        </button>
      ))}
    </div>
  );
};

const InventoryItem = ({ item }) => {
  return (
    <div className="inventory-item">
      <div className="item-image">
        <img src={item.image} alt={item.name} />
        <span className={`rarity rarity-${item.rarity}`}>{item.rarity}★</span>
      </div>
      <div className="item-info">
        <h4>{item.name}</h4>
        <p className="item-type">{item.type}</p>
        <div className="item-count">x{item.count}</div>
      </div>
    </div>
  );
};

const Inventory = ({ items, onFilterChange, activeFilter }) => {
  const filteredItems = activeFilter
    ? items.filter(item => item.rarity === parseInt(activeFilter[0]))
    : items;

  const groupedItems = filteredItems.reduce((acc, item) => {
    const existingItem = acc.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.count++;
    } else {
      acc.push({ ...item, count: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h2>Inventory ({items.length} items)</h2>
        <RarityFilter 
          activeRarity={activeFilter} 
          onFilterChange={onFilterChange} 
        />
      </div>
      
      <div className="inventory-grid">
        {groupedItems.length > 0 ? (
          groupedItems.map((item) => (
            <InventoryItem key={item.id} item={item} />
          ))
        ) : (
          <div className="empty-inventory">
            <p>No items found. Start warping to add items to your inventory!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
